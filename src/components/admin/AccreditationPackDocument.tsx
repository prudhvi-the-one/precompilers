import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { BatchAttendanceRegister } from "@/lib/attendance";
import type { CohortStats } from "@/lib/cohort";
import type { PillarResult } from "@/lib/readiness";

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 10, fontFamily: "Helvetica" },
  title: { fontSize: 16, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  subtitle: { fontSize: 10, color: "#555555", marginBottom: 16 },
  sectionTitle: { fontSize: 12, fontFamily: "Helvetica-Bold", marginTop: 20, marginBottom: 8 },
  table: { display: "flex", flexDirection: "column", borderTopWidth: 1, borderTopColor: "#dddddd" },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
    paddingVertical: 4,
  },
  headerRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
    paddingVertical: 4,
  },
  headerCell: { flex: 1, fontFamily: "Helvetica-Bold" },
  cell: { flex: 1 },
});

export type AccreditationStudentSummary = {
  userId: string;
  name: string | null;
  email: string;
  pctPresent: number | null;
  overallReadiness: number | null;
  pillars: PillarResult[];
};

export default function AccreditationPackDocument({
  batchName,
  trackName,
  institutionName,
  generatedAt,
  register,
  studentSummaries,
  cohortStats,
}: {
  batchName: string;
  trackName: string;
  institutionName: string | null;
  generatedAt: Date;
  register: BatchAttendanceRegister;
  studentSummaries: AccreditationStudentSummary[];
  cohortStats: CohortStats;
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Attendance &amp; Readiness Evidence Pack</Text>
        <Text style={styles.subtitle}>
          {batchName} · {trackName}
          {institutionName ? ` · ${institutionName}` : ""} — generated {generatedAt.toDateString()}
        </Text>

        <Text style={styles.sectionTitle}>Attendance register</Text>
        <View style={styles.table}>
          <View style={styles.headerRow}>
            <Text style={styles.headerCell}>Session</Text>
            <Text style={styles.headerCell}>Date</Text>
            <Text style={styles.headerCell}>Present</Text>
            <Text style={styles.headerCell}>% Present</Text>
          </View>
          {register.sessions.map((session) => (
            <View style={styles.row} key={session.liveClassId}>
              <Text style={styles.cell}>{session.title}</Text>
              <Text style={styles.cell}>{session.scheduledAt.toDateString()}</Text>
              <Text style={styles.cell}>
                {session.presentCount}/{session.totalEnrolled}
              </Text>
              <Text style={styles.cell}>{session.pctPresent}%</Text>
            </View>
          ))}
          {register.sessions.length === 0 ? (
            <View style={styles.row}>
              <Text>No sessions held yet.</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.sectionTitle}>Cohort summary</Text>
        <Text>
          Median readiness: {cohortStats.medianReadiness ?? "—"} · Above 70:{" "}
          {cohortStats.countAbove70} · Below 40: {cohortStats.countBelow40} of{" "}
          {cohortStats.studentCount} students
        </Text>

        <Text style={styles.sectionTitle}>Per-student readiness &amp; attendance</Text>
        <View style={styles.table}>
          <View style={styles.headerRow}>
            <Text style={styles.headerCell}>Student</Text>
            <Text style={styles.headerCell}>Attendance %</Text>
            <Text style={styles.headerCell}>Overall readiness</Text>
          </View>
          {studentSummaries.map((s) => (
            <View style={styles.row} key={s.userId}>
              <Text style={styles.cell}>{s.name ?? s.email}</Text>
              <Text style={styles.cell}>{s.pctPresent !== null ? `${s.pctPresent}%` : "—"}</Text>
              <Text style={styles.cell}>
                {s.overallReadiness !== null ? `${s.overallReadiness}/100` : "Not assessed yet"}
              </Text>
            </View>
          ))}
          {studentSummaries.length === 0 ? (
            <View style={styles.row}>
              <Text>No students enrolled.</Text>
            </View>
          ) : null}
        </View>
      </Page>
    </Document>
  );
}
