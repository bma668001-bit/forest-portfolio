---
title: 视频书单号工作流
summary: 把口播稿、故事分镜、生图、配音和发布素材放进一条半自动流程。
year: 2026
order: 20
draft: false
demo: false
status: evolving
featured: true
cover:
  src: /images/workbenches/book-video-editor.png
  alt: 图书短视频工作台的文案二创界面，包含原始文案、二创文案与校验提示
  width: 3476
  height: 1629
gallery:
  - src: /images/workbenches/video-booklist/input-copy.png
    alt: 视频书单号工作流的输入与文案处理步骤
    width: 679
    height: 510
    caption: 输入与文案处理：先把原始材料整理成可编辑、可确认的文本。
  - src: /images/workbenches/video-booklist/structure-breakdown.png
    alt: 视频书单号工作流的结构拆分步骤
    width: 679
    height: 510
    caption: 结构拆分：把确认后的内容拆成清晰、可修改的节点。
  - src: /images/workbenches/video-booklist/visual-generation.png
    alt: 视频书单号工作流的视觉生成与筛选步骤
    width: 679
    height: 510
    caption: 视觉生成与筛选：统一参考条件，批量生成后再逐项确认。
  - src: /images/workbenches/video-booklist/delivery-info.png
    alt: 视频书单号工作流的交付信息整理步骤
    width: 679
    height: 510
    caption: 交付信息整理：将成品、发布信息和可复用材料集中整理。
  - src: /images/workbenches/video-booklist/quality-check.png
    alt: 视频书单号工作流的质量检查与最终格式步骤
    width: 679
    height: 511
    caption: 质量检查与最终格式：统一检查规则，输出可以直接使用的版本。
tools:
  - DeepSeek API
  - AI 生图
  - TTS
  - 剪映
---

## 为什么要做

一条图书类短视频要经过口播稿、二创、分镜、生图、配音和剪辑。工具一多，稿件、图片和音频很容易彼此对不上，重复复制也会打断判断。

## 我的处理方式

我先保留开头、互动、图书价值和购买引导这些承担具体作用的结构，再重写中段。文案确认后拆成 12 张竖版故事分镜，逐张生成和筛选，最后整理配音、标题、标签与发布简介。

## 我负责什么

我负责选题、二创尺度、内容真实性、分镜连续性、图片筛选、剪辑与发布。DeepSeek API、AI 生图和 TTS 负责生产中间材料。

## 实际变化

稿件、图片、配音和任务状态不再是几组互相割裂的临时文件。已经确认的内容可以保存，出问题的图片也能单独刷新和重选。

## 还在改进

目前的小闭环已经可用。自动抓取、字幕对齐、自动混剪和导出还没有全部接入，我会先观察这些功能是否真的值得维护。

封面展示工作台的文案二创界面，左侧串联分镜提示词、图片生成、发布信息和字幕排版入口。
