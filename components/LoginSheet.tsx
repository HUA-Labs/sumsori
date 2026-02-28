'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { BottomSheet, BottomSheetHeader, BottomSheetContent } from '@hua-labs/ui/overlay';
import { Avatar } from '@hua-labs/ui';
import { SignOut } from '@phosphor-icons/react';

interface LoginSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginSheet({ isOpen, onClose }: LoginSheetProps) {
  const { data: session } = useSession();

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} height="sm">
      <BottomSheetHeader onClose={onClose}>
        {session?.user ? '내 프로필' : '로그인'}
      </BottomSheetHeader>
      <BottomSheetContent className="px-6 pb-8">
        {session?.user ? (
          <div className="flex flex-col items-center gap-5">
            <Avatar
              src={session.user.image ?? undefined}
              alt={session.user.name ?? '사용자'}
              size="lg"
            />
            <p className="text-lg font-semibold">{session.user.name}</p>
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 py-2.5 px-5 rounded-xl text-sm text-[var(--color-muted-foreground)] transition-colors hover:bg-[var(--color-muted)]"
            >
              <SignOut size={18} />
              로그아웃
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-5">
            <p className="text-sm text-[var(--color-muted-foreground)] text-center leading-relaxed">
              로그인하면 나의 감정 기록을<br />저장하고 모아볼 수 있어요.
            </p>
            <button
              onClick={() => signIn('kakao')}
              className="w-full py-3.5 rounded-2xl bg-[#FEE500] text-[#191919] text-sm font-semibold transition-transform active:scale-95"
            >
              카카오로 시작하기
            </button>
          </div>
        )}
      </BottomSheetContent>
    </BottomSheet>
  );
}
