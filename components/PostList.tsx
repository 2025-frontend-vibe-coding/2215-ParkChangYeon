'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import PostCard from './PostCard';
import { postAPI } from '@/lib/api';
import { useAppSelector } from '@/lib/hooks';
import type { PostListDTO } from '@/lib/types';

export default function PostList() {
  const router = useRouter();
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
  const [posts, setPosts] = useState<PostListDTO[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    const fetchPosts = async (page: number) => {
      // 이미 요청 중이면 중복 요청 방지
      if (isFetchingRef.current) {
        return;
      }

      isFetchingRef.current = true;

      try {
        setIsLoading(true);
        const response = await postAPI.getPosts(page, 10);
        if (response.success && response.data && isMounted) {
          setPosts(response.data.content);
          setTotalPages(response.data.totalPages);
          setCurrentPage(response.data.number);
        }
      } catch (error: unknown) {
        if (isMounted) {
          if (error instanceof Error) {
            // 403 에러는 공개 API이므로 조용히 처리 (로그인 없이도 조회 가능)
            // 백엔드 설정 문제일 수 있으므로 에러 메시지만 표시하지 않음
            if (!error.message.includes('403') && !error.message.includes('Forbidden')) {
              alert('게시글 목록을 불러오는데 실패했습니다.');
            }
            // 403 에러인 경우에도 posts는 빈 배열로 유지 (게시글이 없다고 표시)
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
        isFetchingRef.current = false;
      }
    };

    fetchPosts(0);

    return () => {
      isMounted = false;
      isFetchingRef.current = false;
    };
  }, []);

  const handlePageChange = async (page: number) => {
    if (page >= 0 && page < totalPages) {
      try {
        setIsLoading(true);
        const response = await postAPI.getPosts(page, 10);
        if (response.success && response.data) {
          setPosts(response.data.content);
          setTotalPages(response.data.totalPages);
          setCurrentPage(response.data.number);
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          // 403 에러는 공개 API이므로 조용히 처리 (로그인 없이도 조회 가능)
          if (!error.message.includes('403') && !error.message.includes('Forbidden')) {
            alert('게시글 목록을 불러오는데 실패했습니다.');
          }
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDelete = async () => {
    try {
      const response = await postAPI.getPosts(currentPage, 10);
      if (response.success && response.data) {
        setPosts(response.data.content);
        setTotalPages(response.data.totalPages);
        setCurrentPage(response.data.number);
      }
    } catch {
      // 에러는 무시 (인터셉터에서 처리)
    }
  };

  const handleWriteClick = () => {
    if (!isAuthenticated) {
      alert('로그인이 필요한 기능입니다.');
      router.push('/login');
      return;
    }
    router.push('/posts/new');
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-md animate-slide" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">게시판</h1>
        <Button
          onClick={handleWriteClick}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-sm transition-colors"
        >
          글쓰기
        </Button>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-gray-400 text-lg mb-2">게시글이 없습니다</div>
          <div className="text-gray-500 text-sm">첫 번째 게시글을 작성해보세요!</div>
        </div>
      ) : (
        <>
          <div className="grid gap-4">
            {posts.map(post => (
              <PostCard key={post.id} post={post} onDelete={handleDelete} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className="border-gray-300 hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <Button
                    key={i}
                    variant={i === currentPage ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePageChange(i)}
                    className={`min-w-[40px] ${
                      i === currentPage
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages - 1}
                className="border-gray-300 hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
