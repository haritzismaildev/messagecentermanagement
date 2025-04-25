// window.addEventListener('load', function() {
//     // Tunggu hingga Swagger UI selesai dirender.
//     // Perhatikan: selektor berikut mungkin perlu disesuaikan tergantung versi Swagger UI.
//     const titleElement = document.querySelector('.swagger-ui .topbar a span');
//     if (titleElement) {
//       titleElement.style.cursor = 'pointer'; // Ubah kursor agar terlihat clickable.
//       titleElement.addEventListener('click', function() {
//         // Arahkan ulang ke URL yang diinginkan, misalnya:
//         window.location.href = 'http://localhost:3881/api-docs/';
//       });
//     }
//   });

// window.addEventListener('load', function() {
//     // Gunakan timeout agar Swagger UI benar-benar sudah dirender
//     setTimeout(() => {
//       // Coba cari elemen anchor di dalam topbar
//       const topbarAnchor = document.querySelector('.topbar > a');
//       if (topbarAnchor) {
//         console.log("Topbar anchor ditemukan:", topbarAnchor);
//         // Ubah gaya agar terlihat clickable
//         topbarAnchor.style.cursor = 'pointer';
//         // Tambahkan event listener klik
//         topbarAnchor.addEventListener('click', function(e) {
//           // Mencegah perilaku default (jika ada)
//           e.preventDefault();
//           // Arahkan ulang ke URL yang diinginkan
//           window.location.href = 'http://localhost:3881/api-docs/';
//         });
//       } else {
//         console.log("Topbar anchor tidak ditemukan, periksa struktur DOM Swagger UI.");
//       }
//     }, 1000); // Timeout 1 detik; sesuaikan jika diperlukan
//   }); 

window.addEventListener('load', function() {
    // Gunakan timeout yang lebih lama, misalnya 1500ms
    setTimeout(() => {
      // Coba beberapa selector berbeda untuk menangkap elemen topbar yang diinginkan
      let titleElement = document.querySelector('.topbar a'); // alternatif pertama
      if (!titleElement) {
        titleElement = document.querySelector('.topbar .link'); // alternatif kedua
      }
      if (!titleElement) {
        titleElement = document.querySelector('.topbar a span'); // alternatif ketiga
      }
      
      if (titleElement) {
        // Ubah gaya agar terlihat seperti hyperlink
        titleElement.style.cursor = 'pointer';
        titleElement.style.textDecoration = 'underline';
        
        // Tambahkan event listener klik
        titleElement.addEventListener('click', function(e) {
          e.preventDefault();
          window.location.href = 'http://localhost:3881/api-docs/';
        });
        console.log("Topbar anchor ditemukan:", titleElement);
      } else {
        console.log("Topbar anchor tidak ditemukan, periksa struktur DOM Swagger UI.");
      }
    }, 1500); // timeout 1.5 detik
  });
  