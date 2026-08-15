import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { PillarResult } from "@/lib/readiness";

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 10, fontFamily: "Helvetica" },
  title: { fontSize: 16, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  subtitle: { fontSize: 10, color: "#555555", marginBottom: 16 },
  scoreBlock: { marginBottom: 16 },
  scoreLabel: { fontSize: 10, color: "#555555" },
  scoreValue: { fontSize: 28, fontFamily: "Helvetica-Bold", color: "#4F46E5" },
  sectionTitle: { fontSize: 12, fontFamily: "Helvetica-Bold", marginTop: 12, marginBottom: 8 },
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

export default function ReadinessReportDocument({
  name,
  college,
  branch,
  gradYear,
  targetRole,
  overall,
  pillars,
  generatedAt,
}: {
  name: string;
  college: string | null;
  branch: string | null;
  gradYear: number | null;
  targetRole: string | null;
  overall: number | null;
  pillars: PillarResult[];
  generatedAt: Date;
}) {
  const subtitle = [college, branch, gradYear ? `Class of ${gradYear}` : null, targetRole]
    .filter(Boolean)
    .join(" · ");

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{name} — Job Readiness Report</Text>
        <Text style={styles.subtitle}>
          {subtitle} — generated {generatedAt.toDateString()}
        </Text>

        <View style={styles.scoreBlock}>
          <Text style={styles.scoreLabel}>Overall readiness</Text>
          <Text style={styles.scoreValue}>{overall !== null ? overall : "—"}</Text>
        </View>

        <Text style={styles.sectionTitle}>Readiness by pillar</Text>
        <View style={styles.table}>
          <View style={styles.headerRow}>
            <Text style={styles.headerCell}>Pillar</Text>
            <Text style={styles.headerCell}>Score</Text>
            <Text style={styles.headerCell}>Provenance</Text>
            <Text style={styles.headerCell}>Detail</Text>
          </View>
          {pillars.map((pillar) => (
            <View style={styles.row} key={pillar.label}>
              <Text style={styles.cell}>{pillar.label}</Text>
              <Text style={styles.cell}>{pillar.value !== null ? pillar.value : "—"}</Text>
              <Text style={styles.cell}>{pillar.provenance ?? "—"}</Text>
              <Text style={styles.cell}>{pillar.caption}</Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}
