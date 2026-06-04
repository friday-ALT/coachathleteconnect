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
    <div className="oryzo-auth">
      <header className="oryzo-auth__header">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/")} className="rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="oryzo-auth__title">{title}</h1>
        <div className="w-10" />
      </header>
      <div className="oryzo-auth__body">
        {lead && <p className="oryzo-auth__lead">{lead}</p>}
        {children}
      </div>
    </div>
  );
}
