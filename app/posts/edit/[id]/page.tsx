'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PostForm from '@/components/PostForm';
import { postAPI } from '@/lib/api';
import { useAppSelector } from '@/lib/hooks';
import type { PostUpdateDTO } from '@/lib/types';

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = Number(params.id);
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
  const currentUsername = useAppSelector(state => state.auth.username);
  const [postData, setPostData] = useState<PostUpdateDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      alert('로그인이 필요한 기능입니다.');
      router.push('/login');
      return;
    }

    const checkAuthorAndFetchPost = async () => {
      try {
        setIsLoading(true);

        // 먼저 게시글 목록에서 작성자 확인
        let isAuthor = false;
        let page = 0;
        let found = false;

        while (!found) {
          const listResponse = await postAPI.getPosts(page, 10);
          if (listResponse.success && listResponse.data) {
            const post = listResponse.data.content.find(p => p.id === postId);
            if (post) {
              isAuthor = post.username === currentUsername;
              found = true;
            } else if (listResponse.data.last) {
              // 마지막 페이지까지 확인했는데 게시글을 찾지 못함
              alert('존재하지 않는 게시글입니다.');
              router.push('/');
              return;
            } else {
              page++;
            }
          } else {
            break;
          }
        }

        // 작성자가 아니면 접근 차단
        if (!isAuthor) {
          alert('작성자만 수정할 수 있습니다.');
          router.push('/');
          return;
        }

        // 작성자 확인 후 게시글 상세 정보 가져오기 (조회수 증가 없이)
        // 백엔드에 /edit 엔드포인트가 없으면 기존 API 사용
        let response;
        try {
          response = await postAPI.getPostForEdit(postId);
        } catch (editError) {
          // /edit 엔드포인트가 없거나 500 에러면 기존 API 사용 (조회수 증가는 감수)
          if (axios.isAxiosError(editError) && editError.response?.status === 500) {
            response = await postAPI.getPost(postId);
          } else {
            throw editError;
          }
        }

        if (response.success && response.data) {
          setPostData(response.data);
        }
      } catch (error: unknown) {
        // 취소된 요청은 무시
        if (axios.isCancel(error)) {
          return;
        }

        // 취소된 요청으로 표시된 에러도 무시
        if (error instanceof Error && (error as { isCancel?: boolean }).isCancel) {
          return;
        }

        if (error instanceof Error) {
          const errorMessage = error.message || '게시글을 불러오는데 실패했습니다.';
          if (errorMessage.includes('없') || errorMessage.includes('찾을 수')) {
            alert('존재하지 않는 게시글입니다.');
          } else if (errorMessage.includes('권한') || errorMessage.includes('작성자')) {
            alert('작성자만 수정할 수 있습니다.');
          } else if (errorMessage !== 'Request cancelled') {
            // 취소된 요청이 아닌 경우에만 에러 표시
            alert(errorMessage);
          }
        } else {
          alert('게시글을 불러오는데 실패했습니다.');
        }
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthorAndFetchPost();
  }, [postId, isAuthenticated, currentUsername, router]);

  if (!isAuthenticated || isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">로딩 중...</div>
      </div>
    );
  }

  if (!postData) {
    return null;
  }

  const handleSuccess = () => {
    router.push('/');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="ghost" size="icon" className="hover:bg-gray-100 rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">글 수정</h1>
        </div>
        <PostForm initialData={postData} postId={postId} onSubmitSuccess={handleSuccess} />
      </div>
    </div>
  );
}
