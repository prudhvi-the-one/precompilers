"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type EducationDraft = {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startYear: string;
  endYear: string;
  gpa: string;
};

type ExperienceDraft = {
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
};

type ProjectDraft = {
  title: string;
  techStack: string;
  link: string;
  description: string;
};

function emptyEducation(): EducationDraft {
  return { institution: "", degree: "", fieldOfStudy: "", startYear: "", endYear: "", gpa: "" };
}
function emptyExperience(): ExperienceDraft {
  return { company: "", role: "", startDate: "", endDate: "", description: "" };
}
function emptyProject(): ProjectDraft {
  return { title: "", techStack: "", link: "", description: "" };
}

export type ResumeInitialData = {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl: string;
  summary: string;
  skills: string;
  education: EducationDraft[];
  experience: ExperienceDraft[];
  projects: ProjectDraft[];
};

export type ImportableSubmission = {
  id: string;
  title: string;
  link: string;
  description: string;
};

export default function ResumeBuilderForm({
  initialData,
  hasResume,
  importableSubmissions,
}: {
  initialData: ResumeInitialData;
  hasResume: boolean;
  importableSubmissions: ImportableSubmission[];
}) {
  const router = useRouter();
  const [fullName, setFullName] = useState(initialData.fullName);
  const [email, setEmail] = useState(initialData.email);
  const [phone, setPhone] = useState(initialData.phone);
  const [location, setLocation] = useState(initialData.location);
  const [linkedinUrl, setLinkedinUrl] = useState(initialData.linkedinUrl);
  const [githubUrl, setGithubUrl] = useState(initialData.githubUrl);
  const [portfolioUrl, setPortfolioUrl] = useState(initialData.portfolioUrl);
  const [summary, setSummary] = useState(initialData.summary);
  const [skills, setSkills] = useState(initialData.skills);
  const [education, setEducation] = useState<EducationDraft[]>(
    initialData.education.length ? initialData.education : [emptyEducation()]
  );
  const [experience, setExperience] = useState<ExperienceDraft[]>(initialData.experience);
  const [projects, setProjects] = useState<ProjectDraft[]>(initialData.projects);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateEducation(index: number, patch: Partial<EducationDraft>) {
    setEducation((prev) => prev.map((e, i) => (i === index ? { ...e, ...patch } : e)));
  }
  function updateExperience(index: number, patch: Partial<ExperienceDraft>) {
    setExperience((prev) => prev.map((e, i) => (i === index ? { ...e, ...patch } : e)));
  }
  function updateProject(index: number, patch: Partial<ProjectDraft>) {
    setProjects((prev) => prev.map((p, i) => (i === index ? { ...p, ...patch } : p)));
  }

  function importSubmission(submission: ImportableSubmission) {
    setProjects((prev) => [
      ...prev,
      {
        title: submission.title,
        techStack: "",
        link: submission.link,
        description: submission.description,
      },
    ]);
  }

  async function handleSave() {
    setSubmitting(true);
    setError(null);
    setSaved(false);

    const payload = {
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim() || null,
      location: location.trim() || null,
      linkedinUrl: linkedinUrl.trim() || null,
      githubUrl: githubUrl.trim() || null,
      portfolioUrl: portfolioUrl.trim() || null,
      summary: summary.trim() || null,
      skills: skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      education: education
        .filter((e) => e.institution.trim() || e.degree.trim())
        .map((e) => ({
          institution: e.institution.trim(),
          degree: e.degree.trim(),
          fieldOfStudy: e.fieldOfStudy.trim() || null,
          startYear: e.startYear ? Number(e.startYear) : null,
          endYear: e.endYear ? Number(e.endYear) : null,
          gpa: e.gpa.trim() || null,
        })),
      experience: experience
        .filter((e) => e.company.trim() || e.role.trim())
        .map((e) => ({
          company: e.company.trim(),
          role: e.role.trim(),
          startDate: e.startDate.trim(),
          endDate: e.endDate.trim() || null,
          description: e.description.trim(),
        })),
      projects: projects
        .filter((p) => p.title.trim())
        .map((p) => ({
          title: p.title.trim(),
          techStack: p.techStack.trim() || null,
          link: p.link.trim() || null,
          description: p.description.trim(),
        })),
    };

    const res = await fetch("/api/profile/resume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-[#E6E6EF] bg-white p-5 space-y-4">
        <h2 className="font-brand text-base font-bold text-[#0F1020]">Header</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="rounded-md border border-gray-300 p-2.5 text-sm focus:border-black focus:outline-none"
            placeholder="Full name"
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-md border border-gray-300 p-2.5 text-sm focus:border-black focus:outline-none"
            placeholder="Email"
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="rounded-md border border-gray-300 p-2.5 text-sm focus:border-black focus:outline-none"
            placeholder="Phone (optional)"
          />
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="rounded-md border border-gray-300 p-2.5 text-sm focus:border-black focus:outline-none"
            placeholder="Location (optional)"
          />
          <input
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
            className="rounded-md border border-gray-300 p-2.5 text-sm focus:border-black focus:outline-none"
            placeholder="LinkedIn URL (optional)"
          />
          <input
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            className="rounded-md border border-gray-300 p-2.5 text-sm focus:border-black focus:outline-none"
            placeholder="GitHub URL (optional)"
          />
          <input
            value={portfolioUrl}
            onChange={(e) => setPortfolioUrl(e.target.value)}
            className="rounded-md border border-gray-300 p-2.5 text-sm focus:border-black focus:outline-none sm:col-span-2"
            placeholder="Portfolio URL (optional)"
          />
        </div>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          rows={3}
          className="w-full rounded-md border border-gray-300 p-2.5 text-sm focus:border-black focus:outline-none"
          placeholder="Short summary (optional)"
        />
        <input
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          className="w-full rounded-md border border-gray-300 p-2.5 text-sm focus:border-black focus:outline-none"
          placeholder="Skills, comma-separated (e.g. Python, React, SQL)"
        />
      </div>

      <div className="rounded-xl border border-[#E6E6EF] bg-white p-5 space-y-4">
        <h2 className="font-brand text-base font-bold text-[#0F1020]">Education</h2>
        {education.map((e, index) => (
          <div key={index} className="grid grid-cols-1 gap-2 rounded-lg border border-gray-100 bg-gray-50 p-3 sm:grid-cols-3">
            <input
              value={e.institution}
              onChange={(ev) => updateEducation(index, { institution: ev.target.value })}
              className="rounded-md border border-gray-300 p-2 text-sm focus:border-black focus:outline-none"
              placeholder="Institution"
            />
            <input
              value={e.degree}
              onChange={(ev) => updateEducation(index, { degree: ev.target.value })}
              className="rounded-md border border-gray-300 p-2 text-sm focus:border-black focus:outline-none"
              placeholder="Degree"
            />
            <input
              value={e.fieldOfStudy}
              onChange={(ev) => updateEducation(index, { fieldOfStudy: ev.target.value })}
              className="rounded-md border border-gray-300 p-2 text-sm focus:border-black focus:outline-none"
              placeholder="Field of study"
            />
            <input
              value={e.startYear}
              onChange={(ev) => updateEducation(index, { startYear: ev.target.value })}
              className="rounded-md border border-gray-300 p-2 text-sm focus:border-black focus:outline-none"
              placeholder="Start year"
            />
            <input
              value={e.endYear}
              onChange={(ev) => updateEducation(index, { endYear: ev.target.value })}
              className="rounded-md border border-gray-300 p-2 text-sm focus:border-black focus:outline-none"
              placeholder="End year"
            />
            <div className="flex gap-2">
              <input
                value={e.gpa}
                onChange={(ev) => updateEducation(index, { gpa: ev.target.value })}
                className="flex-1 rounded-md border border-gray-300 p-2 text-sm focus:border-black focus:outline-none"
                placeholder="GPA (optional)"
              />
              {education.length > 1 ? (
                <button
                  type="button"
                  onClick={() => setEducation((prev) => prev.filter((_, i) => i !== index))}
                  className="text-xs font-semibold text-red-600 hover:underline"
                >
                  Remove
                </button>
              ) : null}
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setEducation((prev) => [...prev, emptyEducation()])}
          className="text-xs font-semibold text-indigo-600 hover:underline"
        >
          + Add education
        </button>
      </div>

      <div className="rounded-xl border border-[#E6E6EF] bg-white p-5 space-y-4">
        <h2 className="font-brand text-base font-bold text-[#0F1020]">Experience</h2>
        {experience.map((e, index) => (
          <div key={index} className="space-y-2 rounded-lg border border-gray-100 bg-gray-50 p-3">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
              <input
                value={e.company}
                onChange={(ev) => updateExperience(index, { company: ev.target.value })}
                className="rounded-md border border-gray-300 p-2 text-sm focus:border-black focus:outline-none"
                placeholder="Company"
              />
              <input
                value={e.role}
                onChange={(ev) => updateExperience(index, { role: ev.target.value })}
                className="rounded-md border border-gray-300 p-2 text-sm focus:border-black focus:outline-none"
                placeholder="Role"
              />
              <input
                value={e.startDate}
                onChange={(ev) => updateExperience(index, { startDate: ev.target.value })}
                className="rounded-md border border-gray-300 p-2 text-sm focus:border-black focus:outline-none"
                placeholder="Start (e.g. Jun 2025)"
              />
              <input
                value={e.endDate}
                onChange={(ev) => updateExperience(index, { endDate: ev.target.value })}
                className="rounded-md border border-gray-300 p-2 text-sm focus:border-black focus:outline-none"
                placeholder="End (blank = Present)"
              />
            </div>
            <textarea
              value={e.description}
              onChange={(ev) => updateExperience(index, { description: ev.target.value })}
              rows={2}
              className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-black focus:outline-none"
              placeholder="What you did"
            />
            <button
              type="button"
              onClick={() => setExperience((prev) => prev.filter((_, i) => i !== index))}
              className="text-xs font-semibold text-red-600 hover:underline"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setExperience((prev) => [...prev, emptyExperience()])}
          className="text-xs font-semibold text-indigo-600 hover:underline"
        >
          + Add experience
        </button>
      </div>

      <div className="rounded-xl border border-[#E6E6EF] bg-white p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-brand text-base font-bold text-[#0F1020]">Projects</h2>
          {importableSubmissions.length ? (
            <div className="flex flex-wrap gap-2">
              {importableSubmissions.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => importSubmission(s)}
                  className="rounded-full border border-indigo-200 bg-[#F1F0FE] px-2.5 py-1 text-xs font-medium text-indigo-600 hover:bg-[#E4E2FD]"
                >
                  + Import &quot;{s.title}&quot;
                </button>
              ))}
            </div>
          ) : null}
        </div>
        {projects.map((p, index) => (
          <div key={index} className="space-y-2 rounded-lg border border-gray-100 bg-gray-50 p-3">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <input
                value={p.title}
                onChange={(ev) => updateProject(index, { title: ev.target.value })}
                className="rounded-md border border-gray-300 p-2 text-sm focus:border-black focus:outline-none"
                placeholder="Project title"
              />
              <input
                value={p.techStack}
                onChange={(ev) => updateProject(index, { techStack: ev.target.value })}
                className="rounded-md border border-gray-300 p-2 text-sm focus:border-black focus:outline-none"
                placeholder="Tech stack (optional)"
              />
              <input
                value={p.link}
                onChange={(ev) => updateProject(index, { link: ev.target.value })}
                className="rounded-md border border-gray-300 p-2 text-sm focus:border-black focus:outline-none"
                placeholder="Link (optional)"
              />
            </div>
            <textarea
              value={p.description}
              onChange={(ev) => updateProject(index, { description: ev.target.value })}
              rows={2}
              className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-black focus:outline-none"
              placeholder="What it does"
            />
            <button
              type="button"
              onClick={() => setProjects((prev) => prev.filter((_, i) => i !== index))}
              className="text-xs font-semibold text-red-600 hover:underline"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setProjects((prev) => [...prev, emptyProject()])}
          className="text-xs font-semibold text-indigo-600 hover:underline"
        >
          + Add project
        </button>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {saved ? <p className="text-sm text-green-700">Saved.</p> : null}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={submitting || fullName.trim().length === 0}
          className="rounded-md bg-[#0F1020] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {submitting ? "Saving…" : "Save"}
        </button>
        {hasResume ? (
          <a
            href="/api/profile/resume/pdf"
            className="rounded-md border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700"
          >
            Download PDF
          </a>
        ) : null}
      </div>
    </div>
  );
}
