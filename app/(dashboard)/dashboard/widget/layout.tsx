import { ReactNode } from 'react';

export default function WidgetLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      {children}
    </div>
  );
}
