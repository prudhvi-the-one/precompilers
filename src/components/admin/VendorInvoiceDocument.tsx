import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";

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
  totalRow: { flexDirection: "row", marginTop: 8, paddingVertical: 4 },
  totalLabel: { flex: 1, fontFamily: "Helvetica-Bold" },
  totalValue: { flex: 1, fontFamily: "Helvetica-Bold" },
});

function formatRupees(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
}

export default function VendorInvoiceDocument({
  vendorName,
  vendorContactEmail,
  periodMonth,
  activeStudentCount,
  ratePaisePerStudent,
  totalAmountPaise,
  status,
  finalizedAt,
  generatedAt,
}: {
  vendorName: string;
  vendorContactEmail: string;
  periodMonth: string;
  activeStudentCount: number;
  ratePaisePerStudent: number;
  totalAmountPaise: number;
  status: string;
  finalizedAt: Date;
  generatedAt: Date;
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>PreCompilers — Vendor Invoice</Text>
        <Text style={styles.subtitle}>
          {vendorName} · {vendorContactEmail} — generated {generatedAt.toDateString()}
        </Text>

        <Text style={styles.sectionTitle}>Billing period</Text>
        <View style={styles.table}>
          <View style={styles.headerRow}>
            <Text style={styles.headerCell}>Period</Text>
            <Text style={styles.headerCell}>Active students</Text>
            <Text style={styles.headerCell}>Rate / student</Text>
            <Text style={styles.headerCell}>Status</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.cell}>{periodMonth}</Text>
            <Text style={styles.cell}>{activeStudentCount}</Text>
            <Text style={styles.cell}>{formatRupees(ratePaisePerStudent)}</Text>
            <Text style={styles.cell}>{status}</Text>
          </View>
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total amount due</Text>
          <Text style={styles.totalValue}>{formatRupees(totalAmountPaise)}</Text>
        </View>

        <Text style={styles.sectionTitle}>Notes</Text>
        <Text>
          Finalized {finalizedAt.toDateString()}. An active student is one who logged in at
          least once during the billing period. Payment is collected offline — this document is
          a reference invoice, not a payment link.
        </Text>
      </Page>
    </Document>
  );
}
