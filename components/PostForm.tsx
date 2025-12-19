'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { postAPI } from '@/lib/api';
import type { PostCreateDTO, PostUpdateDTO } from '@/lib/types';

const postSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요.').max(200, '제목은 200자 이하여야 합니다.'),
  body: z.string().min(1, '내용을 입력해주세요.').max(5000, '내용은 5000자 이하여야 합니다.'),
});

type PostFormData = z.infer<typeof postSchema>;

interface PostFormProps {
  initialData?: PostCreateDTO | PostUpdateDTO;
  postId?: number;
  onSubmitSuccess?: () => void;
}

export default function PostForm({ initialData, postId, onSubmitSuccess }: PostFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: initialData || { title: '', body: '' },
  });

  const onSubmit = async (data: PostFormData) => {
    try {
      if (postId) {
        await postAPI.updatePost(postId, data);
        alert('게시글이 수정되었습니다.');
      } else {
        await postAPI.createPost(data);
        alert('게시글이 작성되었습니다.');
      }
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        const errorMessage = error.message || '게시글 저장에 실패했습니다.';
        if (errorMessage.includes('없') || errorMessage.includes('찾을 수')) {
          alert('존재하지 않는 게시글입니다.');
        } else if (errorMessage.includes('권한') || errorMessage.includes('작성자')) {
          alert('작성자만 수정할 수 있습니다.');
        } else {
          alert(errorMessage);
        }
      } else {
        alert('게시글 저장에 실패했습니다.');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium text-gray-700">
          제목
        </label>
        <Input
          id="title"
          placeholder="제목을 입력하세요"
          {...register('title')}
          className={`${
            errors.title
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:ring-blue-500'
          } rounded-lg`}
        />
        {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="body" className="text-sm font-medium text-gray-700">
          내용
        </label>
        <textarea
          id="body"
          placeholder="내용을 입력하세요"
          rows={15}
          {...register('body')}
          className={`w-full px-3 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 ${
            errors.body
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:ring-blue-500'
          }`}
        />
        {errors.body && <p className="text-sm text-red-500">{errors.body.message}</p>}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-base font-medium rounded-lg shadow-sm disabled:opacity-50"
      >
        {isSubmitting ? '저장 중...' : postId ? '수정하기' : '작성하기'}
      </Button>
    </form>
  );
}
