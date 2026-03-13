import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { Calendar, ExternalLink, Newspaper } from "lucide-react";
import { useState } from "react";
import { useActor } from "../hooks/useActor";

const MOCK_NEWS = (city: string) => [
  {
    id: "1",
    title: `Top 10 Hidden Gems in ${city} You Must Visit`,
    description: `Discover the secret spots that most tourists miss when visiting ${city}. From tucked-away cafes to breathtaking viewpoints, these gems will make your trip unforgettable.`,
    source: "Wannder Travel",
    publishedAt: new Date().toISOString(),
    url: "#",
  },
  {
    id: "2",
    title: `${city} Named Among Best Travel Destinations 2026`,
    description: `International travel experts have named ${city} as one of the top must-visit destinations this year, praising its unique cultural heritage and modern amenities.`,
    source: "World Travel Magazine",
    publishedAt: new Date(Date.now() - 86400000).toISOString(),
    url: "#",
  },
  {
    id: "3",
    title: `Best Local Restaurants in ${city} for Authentic Cuisine`,
    description: `Food enthusiasts visiting ${city} should not miss these locally-loved eateries that serve authentic dishes passed down through generations.`,
    source: "Gourmet Traveler",
    publishedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    url: "#",
  },
  {
    id: "4",
    title: `Travel Advisory Update: ${city} Safety Tips for Tourists`,
    description: `Stay safe during your visit to ${city} with these essential tips from local authorities and experienced travelers. What to know before you go.`,
    source: "Travel Safety Network",
    publishedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    url: "#",
  },
  {
    id: "5",
    title: `${city} Launches New Eco-Tourism Initiative`,
    description: `${city} has announced a new sustainable tourism program aimed at preserving natural sites while creating authentic experiences for responsible travelers.`,
    source: "Green Travel Today",
    publishedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    url: "#",
  },
];

export function NewsPage() {
  const { actor } = useActor();
  const [selectedCity, setSelectedCity] = useState("");

  const { data: destinations } = useQuery({
    queryKey: ["destinations"],
    queryFn: () => actor!.getAllDestinations(),
    enabled: !!actor,
  });

  const { data: newsData, isLoading } = useQuery({
    queryKey: ["news", selectedCity],
    queryFn: () => actor!.fetchNews(selectedCity),
    enabled: !!actor && !!selectedCity,
  });

  let articles: Array<{
    id: string;
    title: string;
    description: string;
    source: string | { name: string };
    publishedAt: string;
    url: string;
  }> = [];
  if (selectedCity) {
    if (newsData) {
      try {
        const parsed = JSON.parse(newsData);
        articles = parsed.articles || parsed || MOCK_NEWS(selectedCity);
      } catch {
        articles = MOCK_NEWS(selectedCity);
      }
    } else if (!isLoading) {
      articles = MOCK_NEWS(selectedCity);
    }
  }

  return (
    <div className="pt-20 max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold mb-2">Travel News</h1>
        <p className="text-muted-foreground">
          Stay informed about what's happening at your destination
        </p>
      </div>

      <div className="mb-8">
        <Select value={selectedCity} onValueChange={setSelectedCity}>
          <SelectTrigger
            data-ocid="news.destination_select"
            className="w-72 glass border-border"
          >
            <SelectValue placeholder="Select a destination" />
          </SelectTrigger>
          <SelectContent>
            {(destinations || []).map((d) => (
              <SelectItem key={String(d.id)} value={d.city}>
                {d.city}, {d.country}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!selectedCity && (
        <div className="text-center py-20">
          <Newspaper className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Select a destination to read the latest travel news
          </p>
        </div>
      )}

      {isLoading && selectedCity && (
        <div className="space-y-4">
          {["s0", "s1", "s2"].map((sk) => (
            <div
              key={sk}
              className="h-32 rounded-2xl bg-white/5 animate-pulse"
            />
          ))}
        </div>
      )}

      <div className="space-y-4">
        {articles.map((article) => (
          <Card
            key={article.id}
            data-ocid="news.item.1"
            className="glass border-border hover:border-primary/40 transition-all"
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-display font-semibold text-lg mb-2 leading-tight">
                    {article.title}
                  </h3>
                  <p className="text-foreground/70 text-sm mb-3 line-clamp-2">
                    {article.description}
                  </p>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="border-border text-xs">
                      {typeof article.source === "string"
                        ? article.source
                        : article.source?.name}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(article.publishedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                {article.url && article.url !== "#" && (
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 flex-shrink-0"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
