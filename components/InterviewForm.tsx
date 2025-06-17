"use client";

import React, { useState, useEffect } from "react";

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
  const [result, setResult] = useState<{
    success: boolean;
    error?: string;
  } | null>(null);

  useEffect(() => {
    // Fetch user ID from backend
    const fetchUserId = async () => {
      try {
        const res = await fetch("/api/user");
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
    setResult(null);
    try {
      const res = await fetch("/api/vapi/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ success: false, error: (err as Error).message });
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
      {result && (
        <div className="mt-4">
          <pre className="bg-gray-100 p-2 rounded">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </form>
  );
}
