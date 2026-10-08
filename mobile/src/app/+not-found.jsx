import { FileQuestion } from "lucide-react-native";
import { NotFoundState } from "@/components/NotFoundState";

export default function NotFoundScreen() {
  return (
    <NotFoundState
      icon={FileQuestion}
      title="Page not found"
      message="The page you are looking for does not exist."
      backLabel="Go to dashboard"
      backHref="/"
    />
  );
}
