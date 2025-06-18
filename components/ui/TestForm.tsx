"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";

// Reminder: Add <Toaster /> from 'react-hot-toast' to your app root (e.g., _app.tsx or layout.tsx) for toasts to work.

export default function InterviewForm() {
  const [form, setForm] = useState({
    type: "",
    role: "",
    level: "",
    techstack: "",
    amount: 5,
    userid: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch user ID from backend
    const fetchUserId = async () => {
      try {
        const res = await fetch("userId");
        const data = await res.json();
        if (data && data.userid) {
          setForm((prev) => ({ ...prev, userid: data.userid }));
        }
      } catch (err) {
        // Optionally handle error
        console.error("Failed to fetch user ID", err);
      }
    };
    fetchUserId();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "amount" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/vapi/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      toast.success("View your interview below shortly!");
    } catch {
      toast.error("Failed to generate interview.");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 space-y-4">
      <h2 className="text-xl font-bold mb-4">Generate Interview Questions</h2>
      <div>
        <label className="block mb-1">Type (technical/behavioral):</label>
        <input
          name="type"
          value={form.type}
          onChange={handleChange}
          required
          className="w-full border px-2 py-1"
        />
      </div>
      <div>
        <label className="block mb-1">Role:</label>
        <input
          name="role"
          value={form.role}
          onChange={handleChange}
          required
          className="w-full border px-2 py-1"
        />
      </div>
      <div>
        <label className="block mb-1">Level:</label>
        <input
          name="level"
          value={form.level}
          onChange={handleChange}
          required
          className="w-full border px-2 py-1"
        />
      </div>
      <div>
        <label className="block mb-1">Tech Stack (comma separated):</label>
        <input
          name="techstack"
          value={form.techstack}
          onChange={handleChange}
          required
          className="w-full border px-2 py-1"
        />
      </div>
      <div>
        <label className="block mb-1">Amount of Questions:</label>
        <input
          name="amount"
          type="number"
          min="1"
          value={form.amount}
          onChange={handleChange}
          required
          className="w-full border px-2 py-1"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading ? "Generating..." : "Generate"}
      </button>
    </form>
  );
}
