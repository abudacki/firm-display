import { AdminConsole } from "@/components/AdminConsole";
import { getAnnouncements, getProfiles, getQuotes, getSettings } from "@/lib/db";

export default function AdminPage() {
  return (
    <AdminConsole
      initialSettings={getSettings()}
      initialQuotes={getQuotes()}
      initialAnnouncements={getAnnouncements(true)}
      initialProfiles={getProfiles()}
    />
  );
}
