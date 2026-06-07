import { Link } from "wouter";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { GlossButton } from "@/components/app/AppPrimitives";

export default function NotFound() {
  return (
    <div className="helix-site min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <AlertCircle className="h-12 w-12 text-[var(--helix-green)] mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-[var(--helix-gray-100)] mb-2">Page not found</h1>
        <p className="text-[var(--helix-gray-500)] mb-8">
          This page doesn&apos;t exist or may have moved.
        </p>
        <GlossButton asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to home
          </Link>
        </GlossButton>
      </div>
    </div>
  );
}
