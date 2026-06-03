import { useEffect } from "react";
import { useLocation } from "wouter";

/** Legacy /welcome URL → full marketing landing at / */
export default function WelcomeRedirect() {
  const [, setLocation] = useLocation();
  useEffect(() => {
    setLocation("/");
  }, [setLocation]);
  return null;
}
