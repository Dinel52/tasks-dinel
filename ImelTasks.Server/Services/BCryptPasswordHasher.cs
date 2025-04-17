using Microsoft.AspNetCore.Identity;
using ImelTasks.Server.Models;

namespace ImelTasks.Server.Services
{
    public class BCryptPasswordHasher : IPasswordHasher<User>
    {
        public string HashPassword(User user, string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password);
        }

        public PasswordVerificationResult VerifyHashedPassword(User user, string hashedPassword, string providedPassword)
        {
            bool isValid = BCrypt.Net.BCrypt.Verify(providedPassword, hashedPassword);
            return isValid ? PasswordVerificationResult.Success : PasswordVerificationResult.Failed;
        }
    }
}