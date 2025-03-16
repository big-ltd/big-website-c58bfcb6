
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const InvestPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow-sm p-4">
        <div className="container mx-auto">
          <img 
            src="/lovable-uploads/19b593e8-7f17-40ea-9749-27b79f8b8bd1.png" 
            alt="BIG Logo" 
            className="h-10" 
          />
        </div>
      </header>

      <main className="container mx-auto py-10 px-4 flex-grow">
        <h1 className="text-4xl font-bold mb-8 text-center">Investor Relations</h1>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Investment Opportunity</CardTitle>
              <CardDescription>Join our growth journey</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                B.I.G is seeking strategic partners to accelerate our expansion into new markets
                and development of innovative gaming experiences.
              </p>
              <p>
                Our portfolio of mobile games has shown consistent growth and strong user engagement
                metrics, positioning us for significant market expansion.
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Request Investor Deck</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Financial Highlights</CardTitle>
              <CardDescription>Our growth trajectory</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 list-disc pl-5">
                <li>Year-over-year revenue growth of 42%</li>
                <li>User acquisition costs decreased by 18%</li>
                <li>Average revenue per user increased by 27%</li>
                <li>Expansion into 5 new territories in past 12 months</li>
                <li>Daily active users surpassed 1.2 million</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">Download Financial Summary</Button>
            </CardFooter>
          </Card>
        </div>

        <div className="mt-12 max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Contact Our Investment Team</CardTitle>
              <CardDescription>For qualified investors only</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                If you're interested in exploring investment opportunities with B.I.G,
                please contact our investment relations team.
              </p>
              <p className="font-medium">
                Email: invest@big-ltd.com<br />
                Phone: +44 (0) 123 456 7890
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="bg-gray-800 text-white p-6">
        <div className="container mx-auto text-center">
          <p>© {new Date().getFullYear()} B.I.G - Berry Interactive Games Ltd. All information on this page is confidential.</p>
        </div>
      </footer>
    </div>
  );
};

export default InvestPage;
