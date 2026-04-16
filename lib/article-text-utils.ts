type ArticleTextInput = {
  title: string;
  description: string | null;
  content: string | null;
};

const TRUNCATION_SUFFIX = /\s*\[\+\d+\s+chars\]\s*$/i;

export function stripNewsApiTruncation(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  return value.replace(TRUNCATION_SUFFIX, "").trim();
}

export function buildLocalArticleText(article: ArticleTextInput) {
  return [article.title, article.description, stripNewsApiTruncation(article.content)]
    .filter((value): value is string => Boolean(value && value.trim()))
    .join("\n\n")
    .trim();
}