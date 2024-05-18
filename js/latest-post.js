const apiUrl = 'https://back.3blmedia.com/rest/report-announcement/latest-reports?page=';
    const outputElement = document.getElementById('output-latest');
    const prevButton = document.getElementById('prev-button');
    const nextButton = document.getElementById('next-button');
    let currentPage = 0;
    const postsPerPage = 5;

    function fetchReports(page) {
      fetch(apiUrl + page)
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          // Clear the output element
          outputElement.innerHTML = '';

          // Display only the first 5 data in HTML elements
          data.results.slice(0, postsPerPage).forEach(report => {
            let reportElement = document.createElement('div');
            reportElement.classList.add('report');
            reportElement.innerHTML = `
              <div class="mb-5 d-flex justify-content-between main-loop-card">
                <div class="pr-3">
                  <h2 class="mb-1 h4 font-weight-bold">
                    <a class="text-dark" href="https://back.3blmedia.com${report["url-alias"]}">${report["report-title"]}</a>
                  </h2>
                  <p class="excerpt">
                    ${report["report-intro"]}
                  </p>
                  <small class="text-muted">
                    ${report["published-date"]}
                  </small>
                </div>
                <div class="col-md-3 pr-0 text-right">
                  <a href="https://back.3blmedia.com${report["url-alias"]}">
                    <img src="${report["report-image"]}" alt="${report["report-title"]}">
                  </a>
                </div>
              </div>
            `;
            outputElement.appendChild(reportElement);
          });

          // Update button states
          prevButton.disabled = page === 0;
          nextButton.disabled = data.results.length < postsPerPage;
        })
        .catch(error => {
          console.error('Error:', error);
          outputElement.textContent = 'An error occurred while fetching the data.';
        });
    }

    // Event listeners for pagination buttons
    prevButton.addEventListener('click', () => {
      if (currentPage > 0) {
        currentPage--;
        fetchReports(currentPage);
      }
    });

    nextButton.addEventListener('click', () => {
      currentPage++;
      fetchReports(currentPage);
    });

    // Fetch initial reports
    fetchReports(currentPage);