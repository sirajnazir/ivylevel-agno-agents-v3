/**
 * DualViewProvider
 * Context provider for student/parent view mode.
 * @version 10.0
 */

'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useSessionStore, useUserType, UserType } from '@/lib/store/useSessionStore';

interface DualViewContextValue {
  viewMode: 'student' | 'parent';
  isParentView: boolean;
  userType: UserType;
}

const DualViewContext = createContext<DualViewContextValue>({
  viewMode: 'student',
  isParentView: false,
  userType: null,
});

interface DualViewProviderProps {
  children: ReactNode;
}

export function DualViewProvider({ children }: DualViewProviderProps) {
  const userType = useUserType();
  const viewMode = userType === 'parent' ? 'parent' : 'student';
  const isParentView = viewMode === 'parent';

  return (
    <DualViewContext.Provider value={{ viewMode, isParentView, userType }}>
      {children}
    </DualViewContext.Provider>
  );
}

export function useDualView() {
  return useContext(DualViewContext);
}

export function useViewMode() {
  const { viewMode } = useContext(DualViewContext);
  return viewMode;
}

export function useIsParentView() {
  const { isParentView } = useContext(DualViewContext);
  return isParentView;
}

// Helper component for conditional rendering based on view mode
interface ViewModeContentProps {
  student: ReactNode;
  parent: ReactNode;
}

export function ViewModeContent({ student, parent }: ViewModeContentProps) {
  const { isParentView } = useDualView();
  return <>{isParentView ? parent : student}</>;
}

// Pre-built dual view components
interface DualViewTextProps {
  studentText: string;
  parentText: string;
  className?: string;
}

export function DualViewText({ studentText, parentText, className }: DualViewTextProps) {
  const { isParentView } = useDualView();
  return <span className={className}>{isParentView ? parentText : studentText}</span>;
}

interface DualViewCRIProps {
  cri: number;
  className?: string;
}

export function DualViewCRI({ cri, className }: DualViewCRIProps) {
  const { isParentView } = useDualView();
  const boostPercentage = Math.round((cri - 1) * 100);

  if (isParentView) {
    return (
      <div className={className}>
        <span className="text-sm text-gray-500">Context Relativity Index</span>
        <span className="text-2xl font-bold text-gray-900 block">CRI {cri.toFixed(2)}</span>
        <span className="text-xs text-gray-500">Performance relative to expected outcomes</span>
      </div>
    );
  }

  return (
    <div className={className}>
      <span className="text-sm text-amber-600">Your Superpower Boost</span>
      <span className="text-2xl font-bold text-amber-700 block">+{boostPercentage}%</span>
      <span className="text-xs text-amber-600">Your unique background is an advantage!</span>
    </div>
  );
}

export default DualViewProvider;
