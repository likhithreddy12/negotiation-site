"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Intake = {
  fullName: string;
  email: string;
  description: string;
  avatar?: string;
};

export default function DemoPage() {
  const router = useRouter();
  const [intake, setIntake] = useState<Intake | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("negotiation_intake");

    if (!stored) {
      router.replace("/start");
      return;
    }

    setIntake(JSON.parse(stored));
  }, [router]);

  if (!intake) return null;

  return (
    <main style={{ maxWidth: 900, margin: "60px auto", padding: 20 }}>
      <h1 style={{ fontSize: 36, marginBottom: 20 }}>Negotiation Chat</h1>

      <div style={{ border: "1px solid #444", padding: 20, borderRadius: 10 }}>
        <p><b>Name:</b> {intake.fullName}</p>
        <p><b>Email:</b> {intake.email}</p>
        <p><b>Topic:</b> {intake.description}</p>
        <p>
       <b>Selected AI:</b>{" "}
       {intake.avatar ? (
       <>
       {intake.avatar} {intake.avatar === "male" ? "🤵‍♂️" : "👩‍💼"}
       </>
       ) : (
        "not selected"
       )}
</p>

      </div>
    </main>
  );
}
