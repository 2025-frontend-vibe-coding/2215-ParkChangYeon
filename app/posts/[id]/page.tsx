'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Eye } from 'lucide-react';
import axios from 'axios';
import { Card } from '@/components/ui/card';
import { postAPI } from '@/lib/api';
import type { PostDetailDTO } from '@/lib/types';

export default function PostDetailPage() {
  const router = useRouter();
  const params = useParams();
  const postId = Number(params.id);
  const [post, setPost] = useState<PostDetailDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const fetchingPostIdRef = useRef<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    // postId가 유효하지 않으면 리턴
    if (!postId || isNaN(postId)) {
      setIsLoading(false);
      return;
    }

    // 이미 같은 postId에 대한 요청이 진행 중이면 중복 요청 방지
    if (fetchingPostIdRef.current === postId) {
      return;
    }

    fetchingPostIdRef.current = postId;

    const fetchPost = async () => {
      try {
        setIsLoading(true);
        const response = await postAPI.getPost(postId);
        // 취소된 요청이거나 마운트 해제된 경우 무시
        if (!isMounted || fetchingPostIdRef.current !== postId) {
          return;
        }
        if (response.success && response.data) {
          setPost(response.data);
        }
      } catch (error: unknown) {
        // 취소된 요청은 무시
        if (axios.isCancel(error)) {
          return;
        }
        if (isMounted && fetchingPostIdRef.current === postId) {
          if (error instanceof Error) {
            const errorMessage = error.message || '게시글을 불러오는데 실패했습니다.';
            // 403 에러는 인터셉터에서 처리하므로 여기서는 특정 에러만 처리
            if (errorMessage.includes('없') || errorMessage.includes('찾을 수')) {
              alert('존재하지 않는 게시글입니다.');
              router.push('/');
            } else if (!errorMessage.includes('403') && !errorMessage.includes('Forbidden')) {
              alert(errorMessage);
              router.push('/');
            }
          } else {
            alert('게시글을 불러오는데 실패했습니다.');
            router.push('/');
          }
        }
      } finally {
        if (isMounted && fetchingPostIdRef.current === postId) {
          setIsLoading(false);
          fetchingPostIdRef.current = null;
        }
      }
    };

    fetchPost();

    return () => {
      isMounted = false;
      // 컴포넌트가 언마운트되거나 postId가 변경되면 플래그 초기화
      if (fetchingPostIdRef.current === postId) {
        fetchingPostIdRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="h-96 bg-gray-200 rounded-md animate-slide" />
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card className="p-8 shadow-lg border-0">
        <div className="mb-6 pb-6 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="font-medium text-gray-700">{post.username}</span>
            <div className="flex items-center gap-1 text-gray-500">
              <Eye className="h-4 w-4" />
              <span>조회수 {post.view}</span>
            </div>
          </div>
        </div>
        <div className="prose max-w-none">
          <p className="text-gray-700 whitespace-pre-wrap leading-7">{post.body}</p>
        </div>
      </Card>
    </div>
  );
}
