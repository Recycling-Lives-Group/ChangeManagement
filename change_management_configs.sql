/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-12.1.2-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: change_management
-- ------------------------------------------------------
-- Server version	12.1.2-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Dumping data for table `benefit_scoring_config`
--

LOCK TABLES `benefit_scoring_config` WRITE;
/*!40000 ALTER TABLE `benefit_scoring_config` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `benefit_scoring_config` VALUES
(1,'revenueImprovement','Revenue Improvement',100000.00,'GBP',5,'Annual revenue improvement in £. £100,000 = 100 points for value. Timeline: 5 points deducted per month delay.',1,'2025-11-28 10:36:23'),
(2,'costSavings','Cost Savings',50000.00,'GBP',4,'Annual cost savings in £. £80,000 = 100 points for value. Timeline: 4 points deducted per month delay.',1,'2025-12-01 09:48:23'),
(3,'customerImpact','Customer Impact',100.00,'customers',3,'Number of customers impacted. 10,000 customers = 100 points. Timeline: 3 points deducted per month delay.',1,'2025-12-01 09:48:15'),
(4,'processImprovement','Process Improvement',100.00,'percentage',2,'Process efficiency improvement percentage. 100% efficiency gain = 100 points. Timeline: 2 points deducted per month delay.',1,'2025-11-28 10:36:23'),
(5,'internalQoL','Internal Quality of Life',100.00,'employees',2,'Number of employees whose quality of life improves. 500 employees = 100 points. Timeline: 2 points deducted per month delay.',1,'2025-12-01 09:48:30'),
(6,'strategicAlignment','Strategic Alignment',10.00,'scale',0,'Strategic alignment score on 1-10 scale. 10 = perfect alignment = 100 points. No timeline decay.',1,'2025-11-28 10:36:23'),
(8,'riskReduction','Risk Reduction',100.00,'risk_score',0,'Reduction in risk exposure. 100 risk score reduction = 100 points.',1,'2025-12-03 10:15:10');
/*!40000 ALTER TABLE `benefit_scoring_config` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Dumping data for table `effort_scoring_config`
--

LOCK TABLES `effort_scoring_config` WRITE;
/*!40000 ALTER TABLE `effort_scoring_config` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `effort_scoring_config` VALUES
(1,'hoursEstimated','Hours Estimated',1000.00,'hours',0,'Estimated hours to complete the change. 1000 hours = 100 points for effort.',1,'2025-12-02 16:52:46'),
(2,'costEstimated','Cost Estimated',50000.00,'GBP',0,'Estimated financial cost. £50,000 = 100 points for effort.',1,'2025-12-02 16:52:46'),
(3,'resourceRequirement','Resource Requirement',10.00,'people',0,'Number of people/resources required for implementation. 10 people = 100 points.',1,'2025-12-03 09:59:45'),
(4,'complexity','Complexity',10.00,'scale',0,'Technical complexity on 1-10 scale. 10 = maximum complexity = 100 points.',1,'2025-12-02 16:52:46'),
(5,'systemsAffected','Systems Affected',5.00,'systems',0,'Number of systems impacted. 5 systems = 100 points.',1,'2025-12-02 16:52:46'),
(6,'testingRequired','Testing Required',10.00,'scale',0,'Level of testing needed on 1-10 scale. 10 = maximum testing = 100 points.',1,'2025-12-02 16:52:46'),
(7,'documentationRequired','Documentation Required',10.00,'scale',0,'Level of documentation needed on 1-10 scale. 10 = maximum documentation = 100 points.',1,'2025-12-02 16:52:46'),
(8,'urgency','Urgency',10.00,'scale',0,'Time sensitivity and urgency of the change on 1-10 scale. 10 = maximum urgency = 100 points.',1,'2025-12-03 10:00:16');
/*!40000 ALTER TABLE `effort_scoring_config` ENABLE KEYS */;
UNLOCK TABLES;
commit;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2025-12-03 14:49:10
