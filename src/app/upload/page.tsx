import { UploadWidget } from "@/components/UploadWidget";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function UploadPage() {
  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="text-2xl font-semibold">Upload document</h1>
      <p className="text-sm text-slate-600">
        Kept as a URL. Prefer uploading from a member page. Default member for this screen is
        Marco.
      </p>
      <Card>
        <CardHeader>
          <CardTitle>Blood analysis (demo)</CardTitle>
        </CardHeader>
        <CardContent>
          <UploadWidget memberId="m_001" />
        </CardContent>
      </Card>
    </div>
  );
}
