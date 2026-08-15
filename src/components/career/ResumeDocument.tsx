import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { ResumeEducation, ResumeExperience, ResumeProject } from "@prisma/client";

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 10, fontFamily: "Helvetica" },
  name: { fontSize: 20, fontFamily: "Helvetica-Bold", marginBottom: 2 },
  contactLine: { fontSize: 9.5, color: "#555555", marginBottom: 4 },
  linksLine: { fontSize: 9.5, color: "#4F46E5", marginBottom: 12 },
  summary: { fontSize: 10, marginBottom: 12, lineHeight: 1.4 },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    marginTop: 14,
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
    paddingBottom: 2,
  },
  entry: { marginBottom: 8 },
  entryHeadRow: { flexDirection: "row", justifyContent: "space-between" },
  entryTitle: { fontFamily: "Helvetica-Bold" },
  entryDates: { color: "#555555" },
  entrySubtitle: { color: "#555555", marginBottom: 2 },
  entryDescription: { lineHeight: 1.4 },
  skillsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  skillChip: {
    fontSize: 9,
    backgroundColor: "#F1F0FE",
    color: "#4F46E5",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 4,
    marginBottom: 4,
  },
});

export default function ResumeDocument({
  fullName,
  email,
  phone,
  location,
  linkedinUrl,
  githubUrl,
  portfolioUrl,
  summary,
  skills,
  education,
  experience,
  projects,
}: {
  fullName: string;
  email: string;
  phone: string | null;
  location: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  portfolioUrl: string | null;
  summary: string | null;
  skills: string[];
  education: ResumeEducation[];
  experience: ResumeExperience[];
  projects: ResumeProject[];
}) {
  const contactParts = [email, phone, location].filter(Boolean);
  const links = [linkedinUrl, githubUrl, portfolioUrl].filter(Boolean);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.name}>{fullName}</Text>
        <Text style={styles.contactLine}>{contactParts.join(" · ")}</Text>
        {links.length ? <Text style={styles.linksLine}>{links.join("  ·  ")}</Text> : null}
        {summary ? <Text style={styles.summary}>{summary}</Text> : null}

        {skills.length ? (
          <>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.skillsRow}>
              {skills.map((skill) => (
                <Text key={skill} style={styles.skillChip}>
                  {skill}
                </Text>
              ))}
            </View>
          </>
        ) : null}

        {experience.length ? (
          <>
            <Text style={styles.sectionTitle}>Experience</Text>
            {experience.map((e) => (
              <View style={styles.entry} key={e.id}>
                <View style={styles.entryHeadRow}>
                  <Text style={styles.entryTitle}>
                    {e.role} — {e.company}
                  </Text>
                  <Text style={styles.entryDates}>
                    {e.startDate} – {e.endDate ?? "Present"}
                  </Text>
                </View>
                {e.description ? (
                  <Text style={styles.entryDescription}>{e.description}</Text>
                ) : null}
              </View>
            ))}
          </>
        ) : null}

        {projects.length ? (
          <>
            <Text style={styles.sectionTitle}>Projects</Text>
            {projects.map((p) => (
              <View style={styles.entry} key={p.id}>
                <View style={styles.entryHeadRow}>
                  <Text style={styles.entryTitle}>{p.title}</Text>
                  {p.link ? <Text style={styles.entryDates}>{p.link}</Text> : null}
                </View>
                {p.techStack ? <Text style={styles.entrySubtitle}>{p.techStack}</Text> : null}
                {p.description ? (
                  <Text style={styles.entryDescription}>{p.description}</Text>
                ) : null}
              </View>
            ))}
          </>
        ) : null}

        {education.length ? (
          <>
            <Text style={styles.sectionTitle}>Education</Text>
            {education.map((e) => (
              <View style={styles.entry} key={e.id}>
                <View style={styles.entryHeadRow}>
                  <Text style={styles.entryTitle}>{e.institution}</Text>
                  <Text style={styles.entryDates}>
                    {e.startYear ?? ""}
                    {e.startYear && e.endYear ? " – " : ""}
                    {e.endYear ?? ""}
                  </Text>
                </View>
                <Text style={styles.entrySubtitle}>
                  {[e.degree, e.fieldOfStudy, e.gpa ? `GPA ${e.gpa}` : null]
                    .filter(Boolean)
                    .join(" · ")}
                </Text>
              </View>
            ))}
          </>
        ) : null}
      </Page>
    </Document>
  );
}
