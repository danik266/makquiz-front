import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://makquiz.site';

  return [
    // 1. Главная — доступна всем
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/auth`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    // 4. Вход в игру по коду — доступен всем
    {
      url: `${baseUrl}/join`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    // Оставляем /create, ТОЛЬКО если там есть лендинг для гостей.
    // Если при нажатии на /create сразу кидает на логин — удали и этот блок.
    /*
    {
      url: `${baseUrl}/create`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    */
  ];
}