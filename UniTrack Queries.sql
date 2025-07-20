create database UniTrack
use UniTrack;

-- Department table

CREATE TABLE Department (
    department_id INT PRIMARY KEY IDENTITY(1,1),
    deptment_name VARCHAR(100) NOT NULL UNIQUE,
    building VARCHAR(100)
);

EXEC sp_rename 'Department.deptment_name', 'department_name', 'COLUMN';


-- Student table

CREATE TABLE Student (
    student_id INT PRIMARY KEY IDENTITY(1,1),
    student_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    dob DATE,
    department_id INT,
    FOREIGN KEY (department_id) REFERENCES Department(department_id)
);

-- Instructor table

CREATE TABLE Instructor (
    instructor_id INT PRIMARY KEY IDENTITY(1,1),
    instructor_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    department_id INT,
    FOREIGN KEY (department_id) REFERENCES Department(department_id)
);


-- Course table

CREATE TABLE Course (
    course_id INT PRIMARY KEY IDENTITY(1,1),
    title VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    credits INT CHECK (credits >= 1 AND credits <= 6),
    avail_status VARCHAR(20) CHECK (avail_status IN ('Open', 'Closed')),
    department_id INT,
    FOREIGN KEY (department_id) REFERENCES Department(department_id)
);

SELECT name 
FROM sys.check_constraints 
WHERE parent_object_id = OBJECT_ID('Course');

ALTER TABLE Course
DROP CONSTRAINT CK__Course__avail_st__5629CD9C;

EXEC sp_rename 'Course.avail_status', 'availability', 'COLUMN';

ALTER TABLE Course
ADD CONSTRAINT CK_Course_availability
CHECK (availability IN ('Open', 'Closed'));




-- Teaches (Join Table: Instructor - Course)

CREATE TABLE Teaches (
    instructor_id INT,
    course_id INT,
    PRIMARY KEY (instructor_id, course_id),
    FOREIGN KEY (instructor_id) REFERENCES Instructor(instructor_id),
    FOREIGN KEY (course_id) REFERENCES Course(course_id)
);


-- Enrollments (Join Table: Student - Course)

CREATE TABLE Enrollments (
    student_id INT,
    course_id INT,
    enroll_date DATE DEFAULT GETDATE(),
    PRIMARY KEY (student_id, course_id),
    FOREIGN KEY (student_id) REFERENCES Student(student_id),
    FOREIGN KEY (course_id) REFERENCES Course(course_id)
);


-- Grades Table

CREATE TABLE Grades (
    student_id INT,
    course_id INT,
    assignment1 INT CHECK (assignment1 BETWEEN 0 AND 5),
    assignment2 INT CHECK (assignment2 BETWEEN 0 AND 5),
    quiz1 INT CHECK (quiz1 BETWEEN 0 AND 5),
	quiz2 INT CHECK (quiz2 BETWEEN 0 AND 5),
    mid INT CHECK (mid BETWEEN 0 AND 30),
    final INT CHECK (final BETWEEN 0 AND 50),
    grade VARCHAR(2), -- e.g., A, B+, C-
    PRIMARY KEY (student_id, course_id),
    FOREIGN KEY (student_id) REFERENCES Student(student_id),
    FOREIGN KEY (course_id) REFERENCES Course(course_id)
);



INSERT INTO Department (department_name, building)
VALUES 
('Computer Science', 'Block A'),
('Electrical Engineering', 'Block B'),
('Business Administration', 'Block C');

select * from Department;

DBCC CHECKIDENT ('Department', RESEED, 3)


INSERT INTO Student (student_name, email, dob, department_id)
VALUES 
('Ali Raza', 'ali.raza@example.com', '2002-04-15', 1),
('Sara Khan', 'sara.khan@example.com', '2003-08-21', 2),
('Hamza Sheikh', 'hamza.s@example.com', '2001-12-03', 1);


select * from Student;



DBCC CHECKIDENT ('Student', RESEED, 4)




INSERT INTO Instructor (instructor_name, email, department_id)
VALUES 
('Dr. Asma Yousaf', 'asma.y@example.com', 1),
('Prof. Bilal Tariq', 'bilal.t@example.com', 2),
('Dr. Nida Asghar', 'nida.a@example.com', 3);

select * from Instructor;

ALTER TABLE Instructor ADD salary DECIMAL(10,2);
ALTER TABLE Instructor ADD faculty_type VARCHAR(30);

update Instructor
set faculty_type = 'Permanent Faculty';

update Instructor
set faculty_type = 'Visiting Faculty'
where instructor_id = 3;

update Instructor
set salary = 150000
where faculty_type = 'Permanent Faculty';

update Instructor
set salary = 108000
where faculty_type = 'Visiting Faculty';



DBCC CHECKIDENT ('Instructor', RESEED, 4)





INSERT INTO Course (title, code, credits, availability, department_id)
VALUES 
('Database Systems', 'CS301', 3, 'Open', 1),
('Circuits Analysis', 'EE204', 4, 'Closed', 2),
('Marketing Basics', 'BA101', 3, 'Open', 3),
('Web Development', 'CS305', 3, 'Open', 1);

select * from Course;


DBCC CHECKIDENT ('Course', RESEED, 7)


UPDATE Course SET availability = 'Open' WHERE course_id = 2;




INSERT INTO Teaches (instructor_id, course_id)
VALUES 
(1, 1),  -- Dr. Asma Yousaf teaches Database Systems
(2, 2),  -- Prof. Bilal Tariq teaches Circuits Analysis
(3, 3),  -- Dr. Nida Asghar teaches Marketing Basics
(1, 4);  -- Dr. Asma Yousaf also teaches Web Development


select * from Teaches;


INSERT INTO Enrollments (student_id, course_id)
VALUES 
(1, 1),
(1, 4),
(2, 2),
(3, 1),
(3, 4);


select * from Enrollments;

ALTER TABLE Enrollments ADD status VARCHAR(20) DEFAULT 'In Progress';

UPDATE Enrollments
SET status = 'In Progress'
WHERE course_id IN (SELECT course_id FROM Course WHERE availability = 'Open');


UPDATE e
SET status = CASE
    WHEN g.grade IS NULL OR g.grade = 'F' THEN 'Failed'
    ELSE 'Passed'
END
FROM Enrollments e
LEFT JOIN Grades g ON e.student_id = g.student_id AND e.course_id = g.course_id
WHERE e.course_id IN (SELECT course_id FROM Course WHERE availability = 'Closed');


CREATE TRIGGER trg_CourseAvailabilityUpdate
ON Course
AFTER UPDATE
AS
BEGIN
    IF UPDATE(availability)
    BEGIN
        -- Handle Closed: update enrollment status and remove instructors
        UPDATE e
        SET status = CASE
            WHEN g.grade IS NULL OR g.grade = 'F' THEN 'Failed'
            ELSE 'Passed'
        END
        FROM Enrollments e
        LEFT JOIN Grades g ON e.student_id = g.student_id AND e.course_id = g.course_id
        INNER JOIN inserted i ON e.course_id = i.course_id
        WHERE i.availability = 'Closed';

        DELETE t
        FROM Teaches t
        INNER JOIN inserted i ON t.course_id = i.course_id
        WHERE i.availability = 'Closed';

        -- Handle Open: do nothing to existing enrollments
        -- New enrollments will be created as students enroll
    END
END






INSERT INTO Grades (student_id, course_id, assignment1, assignment2, quiz1, quiz2, mid, final, grade)
VALUES 
(1, 1, 4, 5, 4, 5, 27, 42, 'A'),
(1, 4, 3, 4, 3, 4, 25, 40, 'B+'),
(2, 2, 4, 4, 4, 4, 22, 38, 'B'),
(3, 1, 5, 5, 5, 5, 29, 45, 'A+'),
(3, 4, 3, 2, 3, 3, 20, 35, 'B');


select * from Grades where student_id = 1;



-- View all students with their department names:

SELECT s.student_name, s.email, d.department_name
FROM Student s
JOIN Department d ON s.department_id = d.department_id;



-- View enrolled students with course titles:

SELECT s.student_name, c.title, e.enroll_date
FROM Enrollments e
JOIN Student s ON s.student_id = e.student_id
JOIN Course c ON c.course_id = e.course_id;



-- View grades with course and student names:

SELECT s.student_name, c.title, g.assignment1, g.assignment2, g.mid, g.final, g.grade
FROM Grades g
JOIN Student s ON g.student_id = s.student_id
JOIN Course c ON g.course_id = c.course_id;



-- List instructors and the courses they teach

SELECT i.instructor_name, i.email, c.title, c.code
FROM Teaches t
JOIN Instructor i ON t.instructor_id = i.instructor_id
JOIN Course c ON t.course_id = c.course_id;



-- List students with their enrolled course titles and instructors

SELECT s.student_name, c.title AS course_title, i.instructor_name
FROM Enrollments e
JOIN Student s ON e.student_id = s.student_id
JOIN Course c ON e.course_id = c.course_id
JOIN Teaches t ON c.course_id = t.course_id
JOIN Instructor i ON i.instructor_id = t.instructor_id;



-- Calculate total marks (out of 100) for all students

SELECT 
    s.student_name,
    c.title AS course_title,
    g.assignment1 + g.assignment2 + g.quiz1 + g.quiz2 + g.mid + g.final AS total_marks,
    g.grade
FROM Grades g
JOIN Student s ON g.student_id = s.student_id
JOIN Course c ON g.course_id = c.course_id;




-- Courses offered by each department

SELECT d.department_name, c.title AS course_title, c.code
FROM Department d
JOIN Course c ON c.department_id = d.department_id
ORDER BY d.department_name;




-- Students not enrolled in any course

SELECT s.student_id, s.student_name, s.email
FROM Student s
LEFT JOIN Enrollments e ON s.student_id = e.student_id
WHERE e.course_id IS NULL;





-- stop enrolling the student into the course that is closed

CREATE TRIGGER trg_PreventEnrollmentInClosedCourse
ON Enrollments  -- When someone inserts into this table
INSTEAD OF INSERT  -- Instead of allowing it directly, we check condition first
AS
BEGIN
    -- Check: Is the course closed?
    IF EXISTS (
        SELECT 1
        FROM inserted i  -- the new row being inserted
        JOIN Course c ON i.course_id = c.course_id
        WHERE c.availability = 'Closed'
    )
    BEGIN
        -- If the course is closed, stop it!
        RAISERROR ('Cannot enroll in a course that is CLOSED.', 16, 1);
        RETURN;
    END

    -- If all okay, insert the row
    INSERT INTO Enrollments (student_id, course_id, enroll_date)
    SELECT student_id, course_id, enroll_date FROM inserted;
END;


INSERT INTO Course (title, code, credits, availability, department_id)
VALUES 
('Data Structure', 'CS300', 3, 'Closed', 1);

select * from Course;

INSERT INTO Enrollments (student_id, course_id)
VALUES 
(1, 5);

-- Insertion doesn't  work here,



-- stop assigning the Instructor to the course this is unavailable

CREATE TRIGGER trg_PreventAssignInstructorToClosedCourse
ON Teaches
INSTEAD OF INSERT
AS
BEGIN
    -- Check if course is closed
    IF EXISTS (
        SELECT 1
        FROM inserted i
        JOIN Course c ON i.course_id = c.course_id
        WHERE c.availability = 'Closed'
    )
    BEGIN
        RAISERROR ('Cannot assign instructor to a CLOSED course.', 16, 1);
        RETURN;
    END

    -- If okay, insert
    INSERT INTO Teaches (instructor_id, course_id)
    SELECT instructor_id, course_id FROM inserted;
END;


INSERT INTO Teaches (instructor_id, course_id)
VALUES 
(1, 5);  -- Dr. Asma Yousaf couldn't be assigned with Data Structure


select * from Course;


INSERT INTO Course (title, code, credits, availability, department_id)
VALUES 
('Object Oriented Programming', 'CS295', 3, 'Open', 1);



INSERT INTO Teaches (instructor_id, course_id)
VALUES 
(1, 6);  -- Dr. Asma Yousaf could be assigned with OOP

INSERT INTO Enrollments (student_id, course_id)
VALUES 
(1, 6);


-- calculating the grade according to the total marks

CREATE TRIGGER trg_CalculateGrade
ON Grades
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE g
    SET grade = 
        CASE 
            WHEN total >= 86 THEN 'A'
            WHEN total >= 82 THEN 'A-'
            WHEN total >= 78 THEN 'B+'
            WHEN total >= 74 THEN 'B'
            WHEN total >= 70 THEN 'B-'
            WHEN total >= 66 THEN 'C+'
            WHEN total >= 62 THEN 'C'
            WHEN total >= 58 THEN 'C-'
            WHEN total >= 54 THEN 'D+'
            WHEN total >= 50 THEN 'D'
            ELSE 'F'
        END
    FROM Grades g
    INNER JOIN (
        SELECT 
            student_id,
            course_id,
            (ISNULL(assignment1,0) + ISNULL(assignment2,0) + ISNULL(quiz1,0) + ISNULL(quiz2,0) + 
             ISNULL(mid,0) + ISNULL(final,0)) AS total
        FROM inserted
    ) i
    ON g.student_id = i.student_id AND g.course_id = i.course_id
END;


update Grades
set grade = 'A'
where student_id = 3 AND course_id = 1 ;



-- trigger to check before entering the marks that if student is enrolled in that course or not

CREATE TRIGGER trg_EnsureEnrollmentBeforeGrade
ON Grades
INSTEAD OF INSERT
AS
BEGIN
    IF EXISTS (
        SELECT 1
        FROM inserted i
        WHERE NOT EXISTS (
            SELECT 1 
            FROM Enrollments e
            WHERE e.student_id = i.student_id AND e.course_id = i.course_id
        )
    )
    BEGIN
        RAISERROR('Student must be enrolled in the course before assigning grades.', 16, 1);
        RETURN;
    END

    -- If all OK, perform the insert
    INSERT INTO Grades (student_id, course_id, assignment1, assignment2, quiz1, quiz2, mid, final)
    SELECT student_id, course_id, assignment1, assignment2, quiz1, quiz2, mid, final
    FROM inserted;
END;


INSERT INTO Grades (student_id, course_id, assignment1, assignment2, quiz1, quiz2, mid, final)
VALUES (3, 3, 4, 4, 4, 5, 28, 45);

DELETE FROM Grades
WHERE student_id = 1 AND course_id = 3;




INSERT INTO Enrollments (student_id, course_id)
VALUES 
(3, 3);




DROP VIEW StudentCourseGrades;


CREATE VIEW StudentGradeReport AS
SELECT 
    s.student_id,
    s.student_name,
	c.course_id,
    c.title AS course_title,
    i.instructor_name,
    g.assignment1,
    g.assignment2,
    g.quiz1,
    g.quiz2,
    g.mid,
    g.final,
	(g.assignment1 + g.assignment2 + g.quiz1 + g.quiz2 + g.mid + g.final) AS total_marks,
    g.grade
FROM Grades g
JOIN Student s ON g.student_id = s.student_id
JOIN Course c ON g.course_id = c.course_id
JOIN Teaches t ON c.course_id = t.course_id
JOIN Instructor i ON t.instructor_id = i.instructor_id;


SELECT * FROM StudentGradeReport
WHERE course_id = 1;

SELECT * FROM StudentGradeReport
WHERE student_id = 4;




CREATE VIEW CourseEnrollments AS
SELECT 
    c.course_id,
    c.title,
    COUNT(e.student_id) AS total_enrolled
FROM Course c
LEFT JOIN Enrollments e ON c.course_id = e.course_id
GROUP BY c.course_id, c.title;

SELECT * FROM CourseEnrollments



CREATE VIEW InstructorCourses AS
SELECT 
    i.instructor_id,
    i.instructor_name,
    c.course_id,
    c.title AS course_title,
    c.availability
FROM Instructor i
JOIN Teaches t ON i.instructor_id = t.instructor_id
JOIN Course c ON t.course_id = c.course_id;


SELECT * FROM InstructorCourses
WHERE instructor_id = 2;



-- Check students who enrolled but not graded yet

SELECT e.student_id, s.student_name, e.course_id, c.title
FROM Enrollments e
JOIN Student s ON e.student_id = s.student_id
JOIN Course c ON e.course_id = c.course_id
LEFT JOIN Grades g ON e.student_id = g.student_id AND e.course_id = g.course_id
WHERE g.student_id IS NULL;



CREATE OR ALTER PROCEDURE sp_AssignGrades
    @student_id INT,
    @course_id INT,
    @assignment1 INT,
    @assignment2 INT,
    @quiz1 INT,
    @quiz2 INT,
    @mid INT,
    @final INT
AS
BEGIN
    -- Step 1: Calculate total marks
    DECLARE @total INT = @assignment1 + @assignment2 + @quiz1 + @quiz2 + @mid + @final;
    DECLARE @grade VARCHAR(2);

    -- Step 2: Assign grade based on total marks
    IF @total >= 86 SET @grade = 'A';
    ELSE IF @total >= 82 SET @grade = 'A-';
    ELSE IF @total >= 78 SET @grade = 'B+';
    ELSE IF @total >= 74 SET @grade = 'B';
    ELSE IF @total >= 70 SET @grade = 'B-';
    ELSE IF @total >= 66 SET @grade = 'C+';
    ELSE IF @total >= 62 SET @grade = 'C';
    ELSE IF @total >= 58 SET @grade = 'C-';
    ELSE IF @total >= 54 SET @grade = 'D+';
    ELSE IF @total >= 50 SET @grade = 'D';
    ELSE SET @grade = 'F';

    -- Step 3: Update if already exists, else insert new row
    IF EXISTS (
        SELECT 1 
        FROM Grades 
        WHERE student_id = @student_id AND course_id = @course_id
    )
    BEGIN
        UPDATE Grades
        SET assignment1 = @assignment1,
            assignment2 = @assignment2,
            quiz1 = @quiz1,
            quiz2 = @quiz2,
            mid = @mid,
            final = @final,
            grade = @grade
        WHERE student_id = @student_id AND course_id = @course_id;
    END
    ELSE
    BEGIN
        INSERT INTO Grades (student_id, course_id, assignment1, assignment2, quiz1, quiz2, mid, final, grade)
        VALUES (@student_id, @course_id, @assignment1, @assignment2, @quiz1, @quiz2, @mid, @final, @grade);
    END
END;



EXEC sp_AssignGrades 3, 3, 4, 4, 4, 4, 20, 40; -- Insert new

EXEC sp_AssignGrades 3, 3, 3, 3, 2, 4, 19, 44; -- Update that one



EXEC sp_AssignGrades 
    @student_id = 1, 
    @course_id = 6, 
    @assignment1 = 5, 
    @assignment2 = 3, 
    @quiz1 = 0, 
    @quiz2 = 4, 
    @mid = 23, 
    @final = 36;




-- Stored Procedure: Assign Instructor to Course


CREATE PROCEDURE sp_AssignInstructorToCourse
    @instructor_id INT,
    @course_id INT
AS
BEGIN
    -- Check if course is Open
    IF EXISTS (
        SELECT 1 FROM Course
        WHERE course_id = @course_id AND availability = 'Open'
    )
    BEGIN
        -- Prevent duplicate assignment
        IF NOT EXISTS (
            SELECT 1 FROM Teaches
            WHERE instructor_id = @instructor_id AND course_id = @course_id
        )
        BEGIN
            INSERT INTO Teaches (instructor_id, course_id)
            VALUES (@instructor_id, @course_id);
            PRINT 'Instructor assigned successfully.';
        END
        ELSE
        BEGIN
            RAISERROR('Instructor is already assigned to this course.', 16, 1);
        END
    END
    ELSE
    BEGIN
        RAISERROR('Course is not open for assignment.', 16, 1);
    END
END;

EXEC sp_AssignInstructorToCourse @instructor_id = 2, @course_id = 7;


INSERT INTO Course (title, code, credits, availability, department_id)
VALUES 
('Digital Logic Design', 'EE240', 3, 'Open', 2);




-- To mark the course as Open
UPDATE Course
SET availability = 'Open'
WHERE course_id = 3;  -- Replace with actual course ID

-- To mark the course as Closed
UPDATE Course
SET availability = 'Closed'
WHERE course_id = 3;


-- Assign instructor with ID 2 to course with ID 3
INSERT INTO Teaches (instructor_id, course_id)
VALUES (2, 3);

-- Remove the instructor-course mapping
DELETE FROM Teaches
WHERE instructor_id = 2 AND course_id = 3;



SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Course';




                SELECT c.* FROM Course c
                JOIN Enrollments e ON c.course_id = e.course_id
                WHERE e.student_id = 1


				SELECT c.course_id, c.title, c.code, c.availability, COUNT(e.student_id) AS total_students
                FROM Teaches t
                JOIN Course c ON t.course_id = c.course_id
				LEFT JOIN Enrollments e ON t.course_id = e.course_id
                WHERE t.instructor_id = 1


SELECT 
    c.course_id, 
    c.title, 
    c.code, 
    c.availability, 
    COUNT(e.student_id) AS total_students
FROM dbo.Teaches t
JOIN dbo.Course c ON t.course_id = c.course_id
LEFT JOIN dbo.Enrollments e ON t.course_id = e.course_id
WHERE t.instructor_id = 1
GROUP BY c.course_id, c.title, c.code, c.availability







CREATE TABLE Users (
    user_id INT PRIMARY KEY,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('student', 'instructor')) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Student(student_id),
    FOREIGN KEY (user_id) REFERENCES Instructor(instructor_id)
);

DROP TABLE IF EXISTS Users;

CREATE TABLE Users (
    user_id VARCHAR(10) PRIMARY KEY,  -- now it will store 'S1', 'I1', etc.
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('student', 'instructor')) NOT NULL
);




-- Insert students with 'S' prefix
INSERT INTO Users (user_id, password, role)
SELECT 'S' + CAST(student_id AS VARCHAR), 'student123', 'student'
FROM Student;

-- Insert instructors with 'I' prefix
INSERT INTO Users (user_id, password, role)
SELECT 'I' + CAST(instructor_id AS VARCHAR), 'instructor123', 'instructor'
FROM Instructor;




 -- Trigger for Students
CREATE TRIGGER trg_InsertStudent
ON Student
AFTER INSERT
AS
BEGIN
    INSERT INTO Users (user_id, password, role)
    SELECT CONCAT('S', student_id), 'student123', 'student'
    FROM inserted;
END;

-- Trigger for Instructors
CREATE TRIGGER trg_InsertInstructor
ON Instructor
AFTER INSERT
AS
BEGIN
    INSERT INTO Users (user_id, password, role)
    SELECT CONCAT('I', instructor_id), 'instructor123', 'instructor'
    FROM inserted;
END;



INSERT INTO Student (student_name, email, dob, department_id)
VALUES 
('Hasnain Ali', 'hasnain.ali@example.com', '2005-08-25', 3);


select * from Student;


INSERT INTO Instructor (instructor_name, email, department_id)
VALUES 
('Prof. Zahid Nizami', 'zahid.n@example.com', 3);

select * from Instructor;


SELECT user_id, password FROM Users;



        SELECT 
          s.student_id, 
          s.student_name, 
          g.assignment1, g.assignment2, g.quiz1, g.quiz2, g.mid, g.final, 
		  (g.assignment1 + g.assignment2 + g.quiz1 + g.quiz2 + g.mid + g.final) AS total_marks,
		  g.grade
        FROM Enrollments e
        JOIN Student s ON e.student_id = s.student_id
        LEFT JOIN Grades g ON e.student_id = g.student_id AND e.course_id = g.course_id
        WHERE e.course_id = 1;


		ALTER TABLE Grades
		ADD total_marks INT;


		select * from Grades;

		UPDATE Grades
		SET total_marks = ISNULL(assignment1,0) + ISNULL(assignment2,0) + ISNULL(quiz1,0) + ISNULL(quiz2,0) + ISNULL(mid,0) + ISNULL(final,0);



CREATE OR ALTER TRIGGER trg_CalculateTotalMarks
ON Grades
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE g
    SET total_marks = 
        ISNULL(g.assignment1,0) + 
        ISNULL(g.assignment2,0) + 
        ISNULL(g.quiz1,0) + 
        ISNULL(g.quiz2,0) + 
        ISNULL(g.mid,0) + 
        ISNULL(g.final,0)
    FROM Grades g
    INNER JOIN inserted i
        ON g.student_id = i.student_id AND g.course_id = i.course_id;
END;


DROP TRIGGER IF EXISTS trg_CalculateGrade;
DROP TRIGGER IF EXISTS trg_CalculateTotalMarks;

DROP PROCEDURE IF EXISTS sp_AssignGrades;


CREATE PROCEDURE sp_AssignGrades
    @student_id INT,
    @course_id INT,
    @assignment1 INT,
    @assignment2 INT,
    @quiz1 INT,
    @quiz2 INT,
    @mid INT,
    @final INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @total INT = ISNULL(@assignment1,0) + ISNULL(@assignment2,0) + ISNULL(@quiz1,0) + ISNULL(@quiz2,0) + ISNULL(@mid,0) + ISNULL(@final,0);
    DECLARE @grade VARCHAR(2);

    IF @total >= 86 SET @grade = 'A';
    ELSE IF @total >= 82 SET @grade = 'A-';
    ELSE IF @total >= 78 SET @grade = 'B+';
    ELSE IF @total >= 74 SET @grade = 'B';
    ELSE IF @total >= 70 SET @grade = 'B-';
    ELSE IF @total >= 66 SET @grade = 'C+';
    ELSE IF @total >= 62 SET @grade = 'C';
    ELSE IF @total >= 58 SET @grade = 'C-';
    ELSE IF @total >= 54 SET @grade = 'D+';
    ELSE IF @total >= 50 SET @grade = 'D';
    ELSE SET @grade = 'F';

    IF EXISTS (
        SELECT 1 FROM Grades WHERE student_id = @student_id AND course_id = @course_id
    )
    BEGIN
        UPDATE Grades
        SET assignment1 = @assignment1,
            assignment2 = @assignment2,
            quiz1 = @quiz1,
            quiz2 = @quiz2,
            mid = @mid,
            final = @final,
            total_marks = @total,
            grade = @grade
        WHERE student_id = @student_id AND course_id = @course_id;
    END
    ELSE
    BEGIN
        INSERT INTO Grades (student_id, course_id, assignment1, assignment2, quiz1, quiz2, mid, final, total_marks, grade)
        VALUES (@student_id, @course_id, @assignment1, @assignment2, @quiz1, @quiz2, @mid, @final, @total, @grade);
    END
END



SELECT 
    s.student_id,
    s.student_name,
    s.email,
    s.dob,
    d.department_name,
    s.department_id,
    COUNT(e.enrollment_id) AS courses_enrolled
FROM Student s
LEFT JOIN Department d ON s.department_id = d.department_id
LEFT JOIN Enrollments e ON s.student_id = e.student_id
GROUP BY s.student_id, s.student_name, s.email, s.dob, d.department_name, s.department_id
ORDER BY s.student_id




            SELECT 
                e.student_id,
                s.student_name,
                e.course_id,
                c.title AS course_title,
                ISNULL(i.instructor_name, NULL) AS instructor_name,
                e.enroll_date,
				e.status
            FROM Enrollments e
            JOIN Student s ON e.student_id = s.student_id
            JOIN Course c ON e.course_id = c.course_id
            LEFT JOIN Teaches t ON c.course_id = t.course_id
            LEFT JOIN Instructor i ON t.instructor_id = i.instructor_id


			select * from Enrollments