using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace ImelTasks.Server.Models
{
    public class AvatarUploadModel
    {
        [Required]
        public IFormFile Avatar { get; set; }
    }
}