(() => {
  'use strict';

  const articleList = document.querySelector('#article-list');
  const articleContent = document.querySelector('#article-content');
  if (!articleList && !articleContent) return;

  const articleUrl = slug => `article.html?slug=${encodeURIComponent(slug)}`;
  const formatDate = date => new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(`${date}T00:00:00`));

  function createElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
  }

  function createThumbnailImage(article, loading) {
    const image = createElement('img');
    image.src = article.thumbnail || 'assets/blog-thumbnail-placeholder.svg';
    image.alt = article.thumbnailAlt || '';
    image.loading = loading;
    return image;
  }

  function createThumbnail(article) {
    const link = createElement('a', 'article-row-thumbnail');
    link.href = articleUrl(article.slug);
    link.setAttribute('aria-label', `Read: ${article.title}`);
    link.append(createThumbnailImage(article, 'lazy'));
    return link;
  }

  function renderArticleList(articles) {
    const count = document.querySelector('#article-count');
    count.textContent = `${String(articles.length).padStart(2, '0')} ARTICLES`;

    articles.forEach((article, index) => {
      const item = createElement('article', 'article-row');
      const number = createElement('span', 'article-row-number', String(index + 1).padStart(2, '0'));
      const thumbnail = createThumbnail(article);
      const copy = createElement('div', 'article-row-copy');
      const metadata = createElement('div', 'article-row-meta');
      metadata.append(
        createElement('span', 'section-label', article.category.toUpperCase()),
        createElement('span', 'section-label', formatDate(article.date))
      );
      const title = createElement('h3');
      const link = createElement('a', '', article.title);
      link.href = articleUrl(article.slug);
      title.append(link);
      copy.append(metadata, title, createElement('p', '', article.summary));
      const action = createElement('a', 'article-row-action', '↗');
      action.href = articleUrl(article.slug);
      action.setAttribute('aria-label', `Read: ${article.title}`);
      item.append(number, thumbnail, copy, action);
      articleList.append(item);
    });
  }

  function renderArticle(article) {
    const heading = createElement('h1', '', article.title);
    const metadata = createElement('div', 'article-heading-meta');
    metadata.append(
      createElement('span', 'section-label', article.category.toUpperCase()),
      createElement('time', 'section-label', formatDate(article.date)),
      createElement('span', 'section-label', article.readTime.toUpperCase())
    );
    metadata.querySelector('time').dateTime = article.date;

    const body = createElement('div', 'article-body');
    const thumbnail = createElement('figure', 'article-lead-image');
    thumbnail.append(createThumbnailImage(article, 'eager'));
    article.content.forEach(block => {
      if (block.type === 'heading') {
        body.append(createElement('h2', '', block.text));
      } else {
        body.append(createElement('p', '', block.text));
      }
    });

    articleContent.replaceChildren(
      createElement('p', 'section-label', 'UNFORM / INSIGHTS'),
      heading,
      createElement('p', 'article-summary', article.summary),
      metadata,
      thumbnail,
      body,
      createElement('a', 'text-link article-end-link', 'Explore more insights')
    );
    const moreLink = articleContent.querySelector('.article-end-link');
    moreLink.href = 'blog.html';
    moreLink.append(createElement('span', 'link-rule'));

    document.title = `${article.title} | Unform Design Studio`;
    document.querySelector('meta[name="description"]').content = article.summary;
    document.querySelector('link[rel="canonical"]').href = `${location.origin}/article.html?slug=${encodeURIComponent(article.slug)}`;
  }

  function showError() {
    if (articleList) {
      articleList.replaceChildren(createElement('p', 'article-error', 'Articles could not be loaded. Please try again later.'));
      document.querySelector('#article-count').textContent = 'UNAVAILABLE';
    }
    if (articleContent) {
      const message = createElement('p', 'article-error', 'This article could not be found.');
      const link = createElement('a', 'text-link', 'Return to all insights');
      link.href = 'blog.html';
      articleContent.replaceChildren(message, link);
      document.title = 'Article not found | Unform Design Studio';
    }
  }

  fetch('blog-articles.json')
    .then(response => {
      if (!response.ok) throw new Error('Article data could not be loaded.');
      return response.json();
    })
    .then(articles => {
      if (articleList) renderArticleList(articles);
      if (articleContent) {
        const slug = new URLSearchParams(location.search).get('slug');
        const article = articles.find(entry => entry.slug === slug);
        if (article) renderArticle(article);
        else showError();
      }
    })
    .catch(showError);
})();