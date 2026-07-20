"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { ExpertProfileView } from "./_components/expert-profile-view";
import { FresherProfileView } from "./_components/fresher-profile-view";
import { InstitutionProfileView } from "./_components/institution-profile-view";
import { StartupProfileView } from "./_components/startup-profile-view";

const STAKEHOLDER_ROLES = ["expert", "fresher", "startup", "institution"];

export default function ProfilePage() {
  const router = useRouter();
  // (app)/layout.tsx already guarantees a session exists before this page
  // mounts — only the "role isn't one of the 4 stakeholder roles" case
  // needs handling here.
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const lowerRole = getSession()?.roleName.toLowerCase() ?? "";
    if (!STAKEHOLDER_ROLES.includes(lowerRole)) {
      router.replace("/events");
      return;
    }
    setRole(lowerRole);
  }, [router]);

  if (!role) return null;

  return (
    <div className="mx-auto max-w-3xl">
      {role === "expert" && <ExpertProfileView />}
      {role === "fresher" && <FresherProfileView />}
      {role === "startup" && <StartupProfileView />}
      {role === "institution" && <InstitutionProfileView />}
    </div>
  );
}
