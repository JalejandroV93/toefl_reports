"use client";


export default function ReportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <div className="print:hidden">
      </div>
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
    </div>
  );
}
