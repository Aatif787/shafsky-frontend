import { createFileRoute, notFound } from "@tanstack/react-router";
import { getBlogArticle } from "@/data/blogArticles";
import { BlogArticleView } from "@/components/blog/BlogArticleView";
import {
  pageHead,
  articleJsonLd,
  breadcrumbJsonLd,
  faqJsonLd,
} from "@/lib/seo";

export const Route = createFileRoute("/blog/$slug")({
  head: ({ params }) => {
    const article = getBlogArticle(params.slug);
    if (!article) {
      return pageHead({
        title: "Guide not found | Shafsky Aviation",
        description: "The requested guide could not be found.",
        path: "/blog",
        robots: "noindex, nofollow",
      });
    }
    const path = `/blog/${article.slug}`;
    return pageHead({
      title: article.title,
      description: article.description,
      path,
      type: "article",
      jsonLd: [
        breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
          { name: article.title, path },
        ]),
        articleJsonLd({
          title: article.title,
          description: article.description,
          path,
          publishedDate: article.publishedDate,
        }),
        ...(article.faqs.length > 0 ? [faqJsonLd(article.faqs)] : []),
      ],
    });
  },
  loader: ({ params }) => {
    const article = getBlogArticle(params.slug);
    if (!article) throw notFound();
    return article;
  },
  component: BlogArticlePage,
});

function BlogArticlePage() {
  const article = Route.useLoaderData();
  return <BlogArticleView article={article} />;
}
