"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Head from "next/head";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase/client";
import InterviewForm from "@/components/InterviewForm";

export default function InterviewFormPage() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login"); // Redirect if not logged in
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <>
      <Head>
        <title>Generate Your Interview | Hired</title>
        <meta
          name="description"
          content="Generate AI-powered interviews tailored to your role and skills."
        />
      </Head>
      <div className="w-screen min-h-screen flex items-center justify-center bg-background p-4">
        <InterviewForm />
      </div>
    </>
  );
}
