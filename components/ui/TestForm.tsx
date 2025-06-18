"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, X } from "lucide-react";

interface InterviewFormState {
  type: string;
  role: string;
  level: string;
  specialtySkills: string[];
  amount: number;
  userid: string;
}

const questionAmountOptions = [3, 5, 10, 15, 20];

export default function InterviewForm() {
  const [form, setForm] = useState<InterviewFormState>({
    type: "",
    role: "",
    level: "",
    specialtySkills: [],
    amount: 5,
    userid: "",
  });
  const [loading, setLoading] = useState(false);
  const [currentSkillInput, setCurrentSkillInput] = useState("");

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const res = await fetch(""); // Replace with your actual endpoint
        if (!res.ok) {
          let errorMsg = `Failed to fetch user ID: ${res.statusText}`;
          try {
            const errorData = await res.json();
            if (errorData && errorData.message) errorMsg = errorData.message;
          } catch {
            /* ignore */
          }
          console.error("User ID fetch error:", errorMsg);
          toast.error("Could not retrieve user information.");
          return;
        }
        const data = await res.json();
        if (data && data.userid) {
          setForm((prev) => ({ ...prev, userid: data.userid }));
        } else {
          console.warn("User ID not found in response data:", data);
          toast.info(
            "User session not found. Please ensure you are logged in."
          );
        }
      } catch (err) {
        console.error("Failed to fetch user ID:", err);
        toast.error("An error occurred while fetching user data.");
      }
    };
    fetchUserId();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (
    name: keyof Pick<InterviewFormState, "type" | "level" | "amount">,
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      [name]: name === "amount" ? Number.parseInt(value, 10) : value,
    }));
  };

  const handleAddSkill = useCallback(() => {
    const skillToAdd = currentSkillInput.trim();
    if (skillToAdd && !form.specialtySkills.includes(skillToAdd)) {
      setForm((prev) => ({
        ...prev,
        specialtySkills: [...prev.specialtySkills, skillToAdd],
      }));
      setCurrentSkillInput("");
    } else if (form.specialtySkills.includes(skillToAdd)) {
      toast.info(`"${skillToAdd}" is already added.`);
    }
  }, [currentSkillInput, form.specialtySkills]);

  const handleSkillInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setForm((prev) => ({
      ...prev,
      specialtySkills: prev.specialtySkills.filter(
        (skill) => skill !== skillToRemove
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.type) {
      toast.error("Please select an interview type.");
      return;
    }
    if (!form.role.trim()) {
      toast.error("Please enter the role.");
      return;
    }
    if (!form.level) {
      toast.error("Please select an experience level.");
      return;
    }
    if (
      (form.type === "technical" || form.type === "mixed") &&
      form.specialtySkills.length === 0
    ) {
      toast.error(
        "Please add at least one specialty/skill for this interview type."
      );
      return;
    }
    if (!form.amount || !questionAmountOptions.includes(form.amount)) {
      toast.error("Please select a valid number of questions.");
      return;
    }
    if (!form.userid) {
      toast.error(
        "User ID is missing. Cannot submit form. Please try refreshing or logging in."
      );
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        specialtySkills: form.specialtySkills.join(", "), // Convert array to comma-separated string for backend
      };
      const response = await fetch("/api/vapi/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorMessage = `Error: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          /* ignore */
        }
        throw new Error(errorMessage);
      }

      toast.success("Interview generation started! You'll be notified.");
      // Optionally reset form
      // setForm({ type: "", role: "", level: "", specialtySkills: [], amount: 5, userid: form.userid });
      // setCurrentSkillInput("");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An unknown error occurred.";
      toast.error(`Failed to generate interview: ${message}`);
      console.error("Submission error:", error);
    }
    setLoading(false);
  };

  const isSkillsRequired = form.type === "technical" || form.type === "mixed";

  return (
    <div className="flex justify-center items-start md:items-center min-h-screen bg-background p-4 py-8 md:py-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Generate your interview
          </CardTitle>
          <CardDescription>
            Fill in the details below to generate tailored interview questions.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="type">
                Interview Type <span className="text-destructive">*</span>
              </Label>
              <Select
                name="type"
                value={form.type}
                onValueChange={(value) => handleSelectChange("type", value)}
              >
                <SelectTrigger id="type" aria-label="Select interview type">
                  <SelectValue placeholder="Select interview type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="behavioral">Behavioral</SelectItem>
                  <SelectItem value="mixed">
                    Mixed (Technical & Behavioral)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">
                Role <span className="text-destructive">*</span>
              </Label>
              <Input
                id="role"
                name="role"
                value={form.role}
                onChange={handleChange}
                placeholder="e.g., Software Engineer, Product Manager"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="level">
                Experience Level <span className="text-destructive">*</span>
              </Label>
              <Select
                name="level"
                value={form.level}
                onValueChange={(value) => handleSelectChange("level", value)}
              >
                <SelectTrigger id="level" aria-label="Select experience level">
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entry">Entry-Level / Junior</SelectItem>
                  <SelectItem value="mid">Mid-Level</SelectItem>
                  <SelectItem value="senior">Senior-Level</SelectItem>
                  <SelectItem value="staff">Staff / Principal</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialtySkillsInput">
                Specialty/Skills
                {isSkillsRequired && (
                  <span className="text-destructive">*</span>
                )}
              </Label>
              <div className="flex gap-2">
                <Input
                  id="specialtySkillsInput"
                  name="specialtySkillsInput"
                  value={currentSkillInput}
                  onChange={(e) => setCurrentSkillInput(e.target.value)}
                  onKeyDown={handleSkillInputKeyDown}
                  placeholder="Type a skill and press Enter"
                  disabled={!form.type} // Optionally disable if type not selected
                />
                <Button
                  type="button"
                  onClick={handleAddSkill}
                  variant="outline"
                  disabled={!currentSkillInput.trim()}
                >
                  Add
                </Button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {form.specialtySkills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="rounded-full hover:bg-muted-foreground/20 p-0.5"
                      aria-label={`Remove ${skill}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              {!isSkillsRequired && form.type && (
                <p className="text-xs text-muted-foreground">
                  Specialty/Skills are optional for this interview type.
                </p>
              )}
              {isSkillsRequired && (
                <p className="text-xs text-muted-foreground">
                  Add relevant skills, technologies, or areas of expertise.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">
                Number of Questions <span className="text-destructive">*</span>
              </Label>
              <Select
                name="amount"
                value={form.amount.toString()}
                onValueChange={(value) => handleSelectChange("amount", value)}
              >
                <SelectTrigger
                  id="amount"
                  aria-label="Select number of questions"
                >
                  <SelectValue placeholder="Select number" />
                </SelectTrigger>
                <SelectContent>
                  {questionAmountOptions.map((opt) => (
                    <SelectItem key={opt} value={opt.toString()}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              disabled={loading || !form.userid}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Questions"
              )}
            </Button>
          </CardFooter>
        </form>
        {!form.userid && (
          <p className="px-6 pb-4 text-xs text-destructive text-center">
            User information not loaded. Please wait or try refreshing.
          </p>
        )}
      </Card>
    </div>
  );
}
