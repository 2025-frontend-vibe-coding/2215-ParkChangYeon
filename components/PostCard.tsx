'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MoreVertical, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card } from '@/components/ui/card';
import { postAPI } from '@/lib/api';
import { useAppSelector } from '@/lib/hooks';
import type { PostListDTO } from '@/lib/types';

interface PostCardProps {
  post: PostListDTO;
  onDelete?: () => void;
}

export default function PostCard({ post, onDelete }: PostCardProps) {
  const router = useRouter();
  const currentUsername = useAppSelector(state => state.auth.username);
  const isAuthor = currentUsername === post.username;
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      if (!confirm('정말 이 게시글을 삭제하시겠습니까?')) {
        return;
      }

      setIsDeleting(true);
      await postAPI.deletePost(post.id);
      if (onDelete) {
        onDelete();
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        const errorMessage = error.message || '게시글 삭제에 실패했습니다.';
        if (errorMessage.includes('없') || errorMessage.includes('찾을 수')) {
          alert('존재하지 않는 게시글입니다.');
        } else if (errorMessage.includes('권한') || errorMessage.includes('작성자')) {
          alert('작성자만 삭제할 수 있습니다.');
        } else {
          alert(errorMessage);
        }
      } else {
        alert('게시글 삭제에 실패했습니다.');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    // 작성자 확인
    if (!isAuthor) {
      alert('작성자만 수정할 수 있습니다.');
      return;
    }
    confirm('수정하시겠습니까?');
    router.push(`/posts/edit/${post.id}`);
  };

  return (
    <Card className="p-6 hover:shadow-md transition-all duration-300 group border border-gray-100 bg-white rounded-xl">
      <div className="flex items-start justify-between gap-4">
        <Link href={`/posts/${post.id}`} className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors mb-3 line-clamp-2">
            {post.title}
          </h3>
          <div className="flex items-center gap-4 text-sm text-gray-500 mt-3">
            <div className="flex items-center gap-1">
              <span className="font-medium text-gray-700">{post.username}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4 text-gray-400" />
              <span>{post.view}</span>
            </div>
          </div>
        </Link>
        {isAuthor && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100 rounded-full"
              >
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEdit} disabled={isDeleting}>
                <Edit className="mr-2 h-4 w-4" />
                수정
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </Card>
  );
}
