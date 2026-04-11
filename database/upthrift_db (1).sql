-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 11, 2026 at 10:16 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `upthrift_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `comment`
--

CREATE TABLE `comment` (
  `comment_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `content` text NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `parent_comment_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `conversation`
--

CREATE TABLE `conversation` (
  `conversation_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `conversation_participant`
--

CREATE TABLE `conversation_participant` (
  `conversation_participant_id` int(11) NOT NULL,
  `conversation_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `joined_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `event`
--

CREATE TABLE `event` (
  `event_id` int(11) NOT NULL,
  `title` varchar(150) NOT NULL,
  `description` text NOT NULL,
  `event_type` varchar(50) NOT NULL,
  `address` varchar(255) NOT NULL,
  `latitude` decimal(10,8) NOT NULL,
  `longitude` decimal(11,8) NOT NULL,
  `start_datetime` datetime NOT NULL,
  `end_datetime` datetime NOT NULL,
  `organizer_user_id` int(11) DEFAULT NULL,
  `website_url` varchar(255) NOT NULL,
  `image_url` varchar(500) NOT NULL,
  `is_approved` tinyint(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `event_reminder`
--

CREATE TABLE `event_reminder` (
  `reminder_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL COMMENT 'foreign key',
  `event_id` int(11) NOT NULL COMMENT 'foreign key',
  `reminder_setting` varchar(50) NOT NULL,
  `rsvp_status` varchar(20) NOT NULL,
  `event_reminder` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `follow`
--

CREATE TABLE `follow` (
  `follow_id` int(11) NOT NULL,
  `follower_user_id` int(11) NOT NULL,
  `following_user_id` int(11) NOT NULL,
  `followed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `interest`
--

CREATE TABLE `interest` (
  `interest_id` int(11) NOT NULL,
  `interest_name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `message`
--

CREATE TABLE `message` (
  `message_id` int(11) NOT NULL,
  `conversation_id` int(11) NOT NULL,
  `sender_user_id` int(11) NOT NULL,
  `message_text` text NOT NULL,
  `sent_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_read` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `message_media`
--

CREATE TABLE `message_media` (
  `message_media_id` int(11) NOT NULL,
  `message_id` int(11) NOT NULL,
  `media_type` varchar(20) NOT NULL COMMENT 'photo or video',
  `media_url` varchar(500) NOT NULL COMMENT 'file path or url',
  `upload_order` int(11) NOT NULL COMMENT 'order of files'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notification`
--

CREATE TABLE `notification` (
  `notification_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `type` enum('new_like','new_comment','new_follower','new_message','event_reminder','new_share') NOT NULL,
  `related_id` int(11) DEFAULT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `post`
--

CREATE TABLE `post` (
  `post_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `caption` text DEFAULT NULL,
  `category` varchar(50) NOT NULL,
  `creation_date` datetime NOT NULL DEFAULT current_timestamp(),
  `is_public` tinyint(1) NOT NULL DEFAULT 1,
  `location_tag` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `post`
--

INSERT INTO `post` (`post_id`, `user_id`, `caption`, `category`, `creation_date`, `is_public`, `location_tag`) VALUES
(1, 1, NULL, 'Thrift Find', '2026-04-09 11:39:19', 1, 'woijfkfsk'),
(2, 1, NULL, 'Thrift Find', '2026-04-09 11:41:03', 1, 'woijfkfsk'),
(6, 1, NULL, 'Thrift Find', '2026-04-09 12:27:10', 1, 'dublin'),
(7, 2, NULL, 'Clothing', '2026-04-09 12:40:36', 1, 'dublin');

-- --------------------------------------------------------

--
-- Table structure for table `post_like`
--

CREATE TABLE `post_like` (
  `like_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `post_media`
--

CREATE TABLE `post_media` (
  `media_id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `media_type` varchar(20) NOT NULL,
  `meda_url` text NOT NULL,
  `upload_order` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `post_save`
--

CREATE TABLE `post_save` (
  `save_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `saved_at` datetime NOT NULL DEFAULT current_timestamp(),
  `collection_name` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `share`
--

CREATE TABLE `share` (
  `share_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `share_type` varchar(30) NOT NULL,
  `recipient_user_id` int(11) DEFAULT NULL,
  `shared_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `store_review`
--

CREATE TABLE `store_review` (
  `review_id` int(11) NOT NULL,
  `store_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `rating` int(11) NOT NULL,
  `comment` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `store_type`
--

CREATE TABLE `store_type` (
  `store_type_id` int(11) NOT NULL,
  `type_name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `store_type`
--

INSERT INTO `store_type` (`store_type_id`, `type_name`) VALUES
(1, 'charity_shop'),
(2, 'vintage_store'),
(3, 'fleamarket'),
(4, 'consignment');

-- --------------------------------------------------------

--
-- Table structure for table `thrift_store`
--

CREATE TABLE `thrift_store` (
  `store_id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `address` varchar(255) NOT NULL,
  `latitude` decimal(10,8) NOT NULL,
  `longitude` decimal(11,8) NOT NULL,
  `google_maps_url` varchar(500) NOT NULL,
  `phone_number` varchar(30) NOT NULL,
  `website_url` varchar(255) NOT NULL,
  `price_level` varchar(20) NOT NULL,
  `user_submitted` tinyint(1) NOT NULL,
  `submitted_by_user_id` int(11) DEFAULT NULL,
  `verification_status` varchar(20) NOT NULL COMMENT 'pending,verified, rejected',
  `store_type_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `user_id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `profile_pic_url` text DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `join_date` datetime NOT NULL DEFAULT current_timestamp(),
  `is_admin` tinyint(1) NOT NULL DEFAULT 0,
  `is_private_account` tinyint(1) NOT NULL DEFAULT 0,
  `notify_likes` tinyint(1) NOT NULL DEFAULT 1,
  `notify_comments` tinyint(1) NOT NULL DEFAULT 1,
  `notify_follows` tinyint(1) NOT NULL DEFAULT 1,
  `notify_messages` tinyint(1) NOT NULL DEFAULT 1,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `last_login` datetime DEFAULT NULL,
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_expires` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`user_id`, `username`, `email`, `password_hash`, `profile_pic_url`, `bio`, `location`, `join_date`, `is_admin`, `is_private_account`, `notify_likes`, `notify_comments`, `notify_follows`, `notify_messages`, `updated_at`, `last_login`, `reset_token`, `reset_expires`) VALUES
(1, 'kallumks', 'kallumks@tcd.ie', '$2b$10$dKGE75b0iMz1spu.0mRNIeH1g86Yy4pRf3vsvLLt5W3BjqLDELEIq', NULL, NULL, NULL, '2026-04-09 11:36:29', 0, 0, 1, 1, 1, 1, '2026-04-09 10:36:29', NULL, NULL, NULL),
(2, 'lalalal', 'imadead@gmail.com', '$2b$10$PIqUCjFG2KdiF0Gtz9Rjc.kQ44fQ5vVSKMrq7ber1W/6fYo8ZqHsa', NULL, NULL, NULL, '2026-04-09 12:14:03', 0, 0, 1, 1, 1, 1, '2026-04-09 11:14:03', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `user_follow`
--

CREATE TABLE `user_follow` (
  `follow_id` int(11) NOT NULL,
  `follower_id` int(11) NOT NULL,
  `following_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_interest`
--

CREATE TABLE `user_interest` (
  `user_interest_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `interest_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `comment`
--
ALTER TABLE `comment`
  ADD PRIMARY KEY (`comment_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `post_id` (`post_id`),
  ADD KEY `parent_comment_id` (`parent_comment_id`);

--
-- Indexes for table `conversation`
--
ALTER TABLE `conversation`
  ADD PRIMARY KEY (`conversation_id`);

--
-- Indexes for table `conversation_participant`
--
ALTER TABLE `conversation_participant`
  ADD PRIMARY KEY (`conversation_participant_id`),
  ADD UNIQUE KEY `conversation_id` (`conversation_id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `event`
--
ALTER TABLE `event`
  ADD PRIMARY KEY (`event_id`),
  ADD KEY `organizer_user_id` (`organizer_user_id`);

--
-- Indexes for table `event_reminder`
--
ALTER TABLE `event_reminder`
  ADD PRIMARY KEY (`reminder_id`),
  ADD UNIQUE KEY `user_id` (`user_id`,`event_id`),
  ADD KEY `event_id` (`event_id`);

--
-- Indexes for table `follow`
--
ALTER TABLE `follow`
  ADD PRIMARY KEY (`follow_id`),
  ADD UNIQUE KEY `follower_user_id` (`follower_user_id`,`following_user_id`),
  ADD KEY `following_user_id` (`following_user_id`);

--
-- Indexes for table `interest`
--
ALTER TABLE `interest`
  ADD PRIMARY KEY (`interest_id`),
  ADD UNIQUE KEY `interest_name` (`interest_name`);

--
-- Indexes for table `message`
--
ALTER TABLE `message`
  ADD PRIMARY KEY (`message_id`),
  ADD KEY `fk_message_conversation` (`conversation_id`),
  ADD KEY `fk_message_sender` (`sender_user_id`);

--
-- Indexes for table `message_media`
--
ALTER TABLE `message_media`
  ADD PRIMARY KEY (`message_media_id`),
  ADD KEY `fk_message_media_message` (`message_id`);

--
-- Indexes for table `notification`
--
ALTER TABLE `notification`
  ADD PRIMARY KEY (`notification_id`),
  ADD KEY `fk_notification_user` (`user_id`);

--
-- Indexes for table `post`
--
ALTER TABLE `post`
  ADD PRIMARY KEY (`post_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `post_like`
--
ALTER TABLE `post_like`
  ADD PRIMARY KEY (`like_id`),
  ADD UNIQUE KEY `user_id_2` (`user_id`,`post_id`);

--
-- Indexes for table `post_media`
--
ALTER TABLE `post_media`
  ADD PRIMARY KEY (`media_id`),
  ADD UNIQUE KEY `unique_post_media_order` (`post_id`,`upload_order`),
  ADD KEY `post_id` (`post_id`);

--
-- Indexes for table `post_save`
--
ALTER TABLE `post_save`
  ADD PRIMARY KEY (`save_id`),
  ADD UNIQUE KEY `user_id_2` (`user_id`,`post_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `post_id` (`post_id`);

--
-- Indexes for table `share`
--
ALTER TABLE `share`
  ADD PRIMARY KEY (`share_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `post_id` (`post_id`),
  ADD KEY `recipient_user_id` (`recipient_user_id`);

--
-- Indexes for table `store_review`
--
ALTER TABLE `store_review`
  ADD PRIMARY KEY (`review_id`),
  ADD UNIQUE KEY `store_id` (`store_id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `store_type`
--
ALTER TABLE `store_type`
  ADD PRIMARY KEY (`store_type_id`);

--
-- Indexes for table `thrift_store`
--
ALTER TABLE `thrift_store`
  ADD PRIMARY KEY (`store_id`),
  ADD KEY `submitted_by_user_id` (`submitted_by_user_id`),
  ADD KEY `store_type_id` (`store_type_id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `user_follow`
--
ALTER TABLE `user_follow`
  ADD PRIMARY KEY (`follow_id`),
  ADD UNIQUE KEY `follower_id` (`follower_id`,`following_id`),
  ADD KEY `fk_following` (`following_id`);

--
-- Indexes for table `user_interest`
--
ALTER TABLE `user_interest`
  ADD PRIMARY KEY (`user_interest_id`),
  ADD UNIQUE KEY `user_id_2` (`user_id`,`interest_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `inter` (`interest_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `comment`
--
ALTER TABLE `comment`
  MODIFY `comment_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `conversation`
--
ALTER TABLE `conversation`
  MODIFY `conversation_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `conversation_participant`
--
ALTER TABLE `conversation_participant`
  MODIFY `conversation_participant_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `event`
--
ALTER TABLE `event`
  MODIFY `event_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `event_reminder`
--
ALTER TABLE `event_reminder`
  MODIFY `reminder_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `follow`
--
ALTER TABLE `follow`
  MODIFY `follow_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `interest`
--
ALTER TABLE `interest`
  MODIFY `interest_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `message`
--
ALTER TABLE `message`
  MODIFY `message_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `message_media`
--
ALTER TABLE `message_media`
  MODIFY `message_media_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notification`
--
ALTER TABLE `notification`
  MODIFY `notification_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `post`
--
ALTER TABLE `post`
  MODIFY `post_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `post_like`
--
ALTER TABLE `post_like`
  MODIFY `like_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `post_media`
--
ALTER TABLE `post_media`
  MODIFY `media_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `post_save`
--
ALTER TABLE `post_save`
  MODIFY `save_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `share`
--
ALTER TABLE `share`
  MODIFY `share_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `store_review`
--
ALTER TABLE `store_review`
  MODIFY `review_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `store_type`
--
ALTER TABLE `store_type`
  MODIFY `store_type_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `thrift_store`
--
ALTER TABLE `thrift_store`
  MODIFY `store_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `user_follow`
--
ALTER TABLE `user_follow`
  MODIFY `follow_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_interest`
--
ALTER TABLE `user_interest`
  MODIFY `user_interest_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `comment`
--
ALTER TABLE `comment`
  ADD CONSTRAINT `comment_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `comment_ibfk_2` FOREIGN KEY (`post_id`) REFERENCES `post` (`post_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `comment_ibfk_3` FOREIGN KEY (`parent_comment_id`) REFERENCES `comment` (`comment_id`) ON DELETE CASCADE;

--
-- Constraints for table `conversation_participant`
--
ALTER TABLE `conversation_participant`
  ADD CONSTRAINT `conversation_participant_ibfk_1` FOREIGN KEY (`conversation_id`) REFERENCES `conversation` (`conversation_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `conversation_participant_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `event`
--
ALTER TABLE `event`
  ADD CONSTRAINT `event_ibfk_1` FOREIGN KEY (`organizer_user_id`) REFERENCES `user` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `event_reminder`
--
ALTER TABLE `event_reminder`
  ADD CONSTRAINT `event_reminder_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `event_reminder_ibfk_2` FOREIGN KEY (`event_id`) REFERENCES `event` (`event_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `follow`
--
ALTER TABLE `follow`
  ADD CONSTRAINT `follow_ibfk_1` FOREIGN KEY (`follower_user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `follow_ibfk_2` FOREIGN KEY (`following_user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `message`
--
ALTER TABLE `message`
  ADD CONSTRAINT `fk_message_conversation` FOREIGN KEY (`conversation_id`) REFERENCES `conversation` (`conversation_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_message_sender` FOREIGN KEY (`sender_user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `message_media`
--
ALTER TABLE `message_media`
  ADD CONSTRAINT `fk_message_media_message` FOREIGN KEY (`message_id`) REFERENCES `message` (`message_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `notification`
--
ALTER TABLE `notification`
  ADD CONSTRAINT `fk_notification_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `post`
--
ALTER TABLE `post`
  ADD CONSTRAINT `post_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `post_like`
--
ALTER TABLE `post_like`
  ADD CONSTRAINT `post_like_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `post_like_ibfk_2` FOREIGN KEY (`post_id`) REFERENCES `post` (`post_id`) ON DELETE CASCADE;

--
-- Constraints for table `post_media`
--
ALTER TABLE `post_media`
  ADD CONSTRAINT `post_media_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `post` (`post_id`) ON DELETE CASCADE;

--
-- Constraints for table `post_save`
--
ALTER TABLE `post_save`
  ADD CONSTRAINT `post_save_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `post_save_ibfk_2` FOREIGN KEY (`post_id`) REFERENCES `post` (`post_id`) ON DELETE CASCADE;

--
-- Constraints for table `share`
--
ALTER TABLE `share`
  ADD CONSTRAINT `share_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `share_ibfk_2` FOREIGN KEY (`post_id`) REFERENCES `post` (`post_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `share_ibfk_3` FOREIGN KEY (`recipient_user_id`) REFERENCES `user` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `store_review`
--
ALTER TABLE `store_review`
  ADD CONSTRAINT `store_review_ibfk_1` FOREIGN KEY (`store_id`) REFERENCES `thrift_store` (`store_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `store_review_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `thrift_store`
--
ALTER TABLE `thrift_store`
  ADD CONSTRAINT `thrift_store_ibfk_1` FOREIGN KEY (`submitted_by_user_id`) REFERENCES `user` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `thrift_store_ibfk_2` FOREIGN KEY (`store_type_id`) REFERENCES `store_type` (`store_type_id`) ON UPDATE CASCADE;

--
-- Constraints for table `user_follow`
--
ALTER TABLE `user_follow`
  ADD CONSTRAINT `fk_follower` FOREIGN KEY (`follower_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_following` FOREIGN KEY (`following_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user_interest`
--
ALTER TABLE `user_interest`
  ADD CONSTRAINT `interest_id` FOREIGN KEY (`interest_id`) REFERENCES `interest` (`interest_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
