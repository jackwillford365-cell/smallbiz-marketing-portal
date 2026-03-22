import { Layout } from "@/components/Layout";
import { Link } from "wouter";
import { Button } from "@/components/ui-elements";

export default function NotFound() {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <h1 className="text-8xl font-display font-bold text-primary/20 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-white mb-2">Page Not Found</h2>
        <p className="text-muted-foreground mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <Link href="/">
          <Button variant="primary">Return Home</Button>
        </Link>
      </div>
    </Layout>
  );
}
