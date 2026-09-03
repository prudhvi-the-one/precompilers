import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 48,
    fontSize: 11,
    fontFamily: "Helvetica",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  border: {
    borderWidth: 2,
    borderColor: "#1a1a1a",
    padding: 40,
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  eyebrow: { fontSize: 11, color: "#555555", marginBottom: 12, letterSpacing: 1 },
  title: { fontSize: 26, fontFamily: "Helvetica-Bold", marginBottom: 24, textAlign: "center" },
  studentName: { fontSize: 20, fontFamily: "Helvetica-Bold", marginBottom: 8, textAlign: "center" },
  body: { fontSize: 12, color: "#333333", marginBottom: 24, textAlign: "center" },
  vendorName: { fontSize: 14, fontFamily: "Helvetica-Bold" },
  meta: { fontSize: 10, color: "#666666", marginTop: 32, textAlign: "center" },
});

export default function VendorCertificateDocument({
  studentName,
  vendorName,
  completionPercent,
  issuedAt,
}: {
  studentName: string;
  vendorName: string;
  completionPercent: number;
  issuedAt: Date;
}) {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.border}>
          <Text style={styles.eyebrow}>CERTIFICATE OF COMPLETION</Text>
          <Text style={styles.title}>PreCompilers</Text>
          <Text style={styles.studentName}>{studentName}</Text>
          <Text style={styles.body}>
            has successfully completed {completionPercent}% of the assigned coursework for
          </Text>
          <Text style={styles.vendorName}>{vendorName}</Text>
          <Text style={styles.meta}>Issued {issuedAt.toDateString()}</Text>
        </View>
      </Page>
    </Document>
  );
}
