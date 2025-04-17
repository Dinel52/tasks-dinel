namespace ImelTasks.Server.Models
{
    public class UserVersion
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string Name { get; set; }
        public bool IsAdmin { get; set; }
        public DateTime VersionDate { get; set; } = DateTime.Now;
        public int VersionNumber { get; set; }

        public virtual User User { get; set; }
    }
}

namespace ImelTasks.Server.Models
{
    public class AuditLog
    {
        public int Id { get; set; }
        public string EntityType { get; set; } 
        public string EntityId { get; set; }   
        public string Action { get; set; }    
        public string UserId { get; set; }    
        public string UserName { get; set; }  
        public DateTime Timestamp { get; set; } = DateTime.Now;
        public string Changes { get; set; } 
    }
}