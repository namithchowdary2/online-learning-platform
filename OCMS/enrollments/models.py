from django.db import models
from accounts.models import User
from courses.models import Course, Lecture
class Enrollment(models.Model):
    id = models.AutoField(primary_key=True)
    student_id = models.ForeignKey(User, on_delete=models.CASCADE)
    course_id = models.ForeignKey(Course, on_delete=models.CASCADE)
    status = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return f"{self.student_id} - {self.course_id}"
class LectureProgress(models.Model):
    id = models.AutoField(primary_key=True)
    enrollment_id = models.ForeignKey(Enrollment, on_delete=models.CASCADE)
    lecture_id = models.ForeignKey(Lecture, on_delete=models.CASCADE)
    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    def __str__(self):
        return f"{self.lecture_id} - {self.completed}"