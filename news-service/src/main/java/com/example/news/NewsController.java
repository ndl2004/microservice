package com.example.news;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Comparator;
import java.util.List;

@RestController
@RequestMapping("/news")
public class NewsController {

    private static final Logger log = LoggerFactory.getLogger(NewsController.class);

    private final NewsPostRepository repository;

    public NewsController(NewsPostRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<NewsPost> getAll(@RequestParam(required = false) String status) {
        if (status != null && !status.isBlank()) {
            return repository.findByStatusOrderByDateDesc(status.toUpperCase());
        }

        return repository.findAll()
                .stream()
                .sorted(Comparator.comparing(NewsPost::getDate, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
    }

    @GetMapping("/{id}")
    public NewsPost getById(@PathVariable Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("News post not found"));
    }

    @PostMapping
    public NewsPost create(@RequestBody NewsPost post) {
        NewsPost savedPost = repository.save(post);
        log.info("Created news post id={}", savedPost.getId());
        return savedPost;
    }

    @PutMapping("/{id}")
    public NewsPost update(@PathVariable Long id, @RequestBody NewsPost request) {
        NewsPost post = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("News post not found"));

        post.setTitle(request.getTitle());
        post.setCategory(request.getCategory());
        post.setSummary(request.getSummary());
        post.setContent(request.getContent());
        post.setAuthor(request.getAuthor());
        post.setStatus(request.getStatus());
        post.setDate(request.getDate());
        post.setImage(request.getImage());

        NewsPost savedPost = repository.save(post);
        log.info("Updated news post id={}", savedPost.getId());
        return savedPost;
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("News post not found");
        }

        repository.deleteById(id);
        log.info("Deleted news post id={}", id);
    }
}
