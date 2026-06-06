import type { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "../ui/button";
import { ArrowLeft } from "lucide-react";

type OryzoAuthFrameProps = {
  title: string;
  children: ReactNode;
  lead?: string;
};

export function OryzoAuthFrame({ title, children, lead }: OryzoAuthFrameProps) {
  const [, setLocation] = useLocation();

  return (
    <div className="helix-auth">
      <header className="helix-auth__header">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/")} className="rounded-full text-[var(--helix-gray-200)]">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="helix-auth__title">{title}</h1>
        <div className="w-10" />
      </header>
      <div className="helix-auth__body">
        {lead && <p className="helix-auth__lead">{lead}</p>}
        {children}
      </div>
    </div>
  );
}
