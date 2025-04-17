using System.ComponentModel.DataAnnotations;

namespace ImelTasks.Server.Models
{
    public class CreateUserModel
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        public string Username { get; set; }

        [Required]
        [MinLength(6)]
        public string Password { get; set; }

        [MaxLength(50)]
        public string? Name { get; set; }

        public bool IsAdmin { get; set; } = false;
    }

    public class UpdateUserModel
    {
        [EmailAddress]
        public string? Email { get; set; }

        public string? Username { get; set; }

        [MinLength(6)]
        public string? Password { get; set; }

        [MaxLength(50)]
        public string? Name { get; set; }

        public bool? IsAdmin { get; set; }
    }

    public class StatusUpdateModel
    {
        [Required]
        public bool IsActive { get; set; }
    }
}