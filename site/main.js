
document.addEventListener('DOMContentLoaded', () => {
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            
            header.classList.toggle('active');

            const content = header.nextElementSibling;

            if (content.style.maxHeight) {
                content.style.maxHeight = null;
                content.style.padding = "0 18px"; 
            } else {
                content.style.padding = "15px 18px"; 
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    });

    const newsList = document.getElementById('news-list');
    if (newsList) { 
        fetch('api/news.json')
            .then(response => response.json())
            .then(newsData => {
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
                newsList.innerHTML = '<p>Не удалось загрузить новости.</p>';
            });
    }
});