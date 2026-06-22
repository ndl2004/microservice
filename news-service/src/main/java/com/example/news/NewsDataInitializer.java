package com.example.news;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class NewsDataInitializer implements CommandLineRunner {

    private final NewsPostRepository repository;

    public NewsDataInitializer(NewsPostRepository repository) {
        this.repository = repository;
    }

    @Override
    public void run(String... args) {
        if (repository.count() > 0) {
            return;
        }

        createPost(
                "Quy trinh cham soc da co ban",
                "beauty_tips",
                "Goi y cac buoc cham soc da don gian cho buoi sang va buoi toi.",
                "Mot quy trinh cham soc da co ban thuong gom lam sach, can bang, serum, duong am va chong nang vao ban ngay. Nguoi moi bat dau nen chon san pham diu nhe va theo doi phan ung cua da.",
                "Luna Team",
                LocalDate.of(2026, 6, 19)
        );

        createPost(
                "Xu huong trang diem tu nhien",
                "trends",
                "Lop nen mong nhe va mau son tu nhien van duoc nhieu khach hang yeu thich.",
                "Trang diem tu nhien uu tien lop nen mong, ma hong nhe va son co sac gan mau moi. Phong cach nay phu hop di hoc, di lam va giup khach hang de chon san pham khi mua online.",
                "Beauty Editor",
                LocalDate.of(2026, 6, 18)
        );

        createPost(
                "Uu dai thanh vien Luna",
                "promotion",
                "Khach hang dang ky tai khoan co the nhan thong bao uu dai moi.",
                "Chuong trinh thanh vien giup cua hang giu lien he voi khach hang cu, gioi thieu san pham moi va tao cac ma uu dai theo mua.",
                "Admin",
                LocalDate.of(2026, 6, 17)
        );
    }

    private void createPost(String title, String category, String summary, String content, String author, LocalDate date) {
        NewsPost post = new NewsPost();
        post.setTitle(title);
        post.setCategory(category);
        post.setSummary(summary);
        post.setContent(content);
        post.setAuthor(author);
        post.setStatus("PUBLISHED");
        post.setDate(date);
        repository.save(post);
    }
}
