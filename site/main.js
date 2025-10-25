// site/main.js
document.addEventListener('DOMContentLoaded', () => {
    fetch('api/news.json')
        .then(response => response.json())
        .then(newsData => {
            const newsList = document.getElementById('news-list');
            if (newsData.length === 0) {
                newsList.innerHTML = '<p>Нет свежих новостей.</p>';
                return;
            }

            newsList.innerHTML = '';
            newsData.forEach(item => {
                const newsItem = document.createElement('div');
                newsItem.className = 'update-item';
                newsItem.innerHTML = `
                    <h3>${item.date} — <span class="version-tag">${item.version}</span></h3>
                    <p>${item.text}</p>
                `;
                newsList.appendChild(newsItem);
            });
        })
        .catch(error => {
            console.error('Ошибка при загрузке новостей:', error);
            document.getElementById('news-list').innerHTML = '<p>Не удалось загрузить новости.</p>';
        });
});