import { PrismaClient } from "@prisma/client";
import express from "express";
const cors = require("cors");

const prisma = new PrismaClient();
const app = express();
const port = process.env.PORT || 3005;

app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.options("*", cors());
app.use(express.json());

// Routes
app.get("/posts", async (req, res) => {
  try {
    const posts = await prisma.blogPost.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        author: true,
        cardColor: true,
        coverImage: true,
        category: true,
        createdAt: true,
        updatedAt: true
      }
    });
    res.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

app.get("/posts/:id", async (req, res) => {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { id: Number(req.params.id) }
    });
    
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    
    res.json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ error: "Failed to fetch post" });
  }
});

app.post("/posts", async (req, res) => {
  try {
    const { title, content, author, cardColor, coverImage, category } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }

    const post = await prisma.blogPost.create({
      data: {
        title: title || "Untitled Post",
        content: content,
        author: author || "Anonymous",
        cardColor: cardColor || "#FF5733", // Default color
        coverImage: coverImage || null,
        category: category || "Uncategorized"
      }
    });
    
    res.status(201).json(post);
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ error: "Failed to create post" });
  }
});

app.put("/posts/:id", async (req, res) => {
  try {
    const { title, content, author, cardColor, coverImage, category } = req.body;
    
    const existingPost = await prisma.blogPost.findUnique({
      where: { id: Number(req.params.id) }
    });
    
    if (!existingPost) {
      return res.status(404).json({ error: "Post not found" });
    }

    const post = await prisma.blogPost.update({
      where: { id: Number(req.params.id) },
      data: {
        title: title || existingPost.title,
        content: content || existingPost.content,
        author: author || existingPost.author,
        cardColor: cardColor || existingPost.cardColor,
        coverImage: coverImage !== undefined ? coverImage : existingPost.coverImage,
        category: category || existingPost.category
      }
    });
    
    res.json(post);
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ error: "Failed to update post" });
  }
});

app.delete("/posts/:id", async (req, res) => {
  try {
    await prisma.blogPost.delete({
      where: { id: Number(req.params.id) }
    });
    
    res.json({ 
      status: "ok",
      message: "Post deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ error: "Failed to delete post" });
  }
});

app.get("/", (req, res) => {
  res.send(`
    <h1>Blog Post API</h1>
    <h2>Endpoints:</h2>
    <pre>
      GET, POST /posts
      GET, PUT, DELETE /posts/:id
    </pre>
    <h2>Post Structure:</h2>
    <pre>
      {
        title: string,
        content: Json,
        author?: string,
        cardColor?: string (hex color),
        coverImage?: string (url),
        category?: string
      }
    </pre>
  `);
});

app.listen(Number(port), "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${port}`);
});