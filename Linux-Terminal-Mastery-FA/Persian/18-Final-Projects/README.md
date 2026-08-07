# فصل هجدهم: پروژه‌های نهایی لینوکس

## Linux Final Projects

در ۱۹ فصل گذشته با بخش‌های مختلف لینوکس آشنا شدیم.

از:

- ترمینال
- فایل سیستم
- مدیریت کاربران
- Permissionها
- Package Management
- Processها
- Networking
- Bash Scripting
- Automation
- Security
- Server Administration

اکنون زمان آن رسیده است که این دانش را در پروژه‌های واقعی استفاده کنیم.

هدف این فصل:

تبدیل دانش تئوری به تجربه عملی.

---

# چرا پروژه مهم است؟

یادگیری لینوکس فقط با حفظ کردن دستورها کامل نمی‌شود.

یک کاربر حرفه‌ای باید بتواند:

- مشکل پیدا کند.
- ابزار بسازد.
- سیستم مدیریت کند.
- فرآیندها را خودکار کند.
- امنیت سیستم را افزایش دهد.

پروژه‌ها باعث می‌شوند مهارت‌ها در یک محیط واقعی ترکیب شوند.

---

# ساختار یک پروژه حرفه‌ای لینوکس

هر پروژه بهتر است شامل بخش‌های زیر باشد:

    Project Name

    README.md

    Scripts/

    Config/

    Logs/

    Documentation/

    Tests/

---

# مستندسازی پروژه

یک پروژه حرفه‌ای بدون Documentation کامل نیست.

README باید شامل:

- معرفی پروژه
- نصب
- نحوه استفاده
- مثال‌ها
- تنظیمات
- مشکلات احتمالی

باشد.

---

# مدیریت پروژه با Git

Git یکی از مهم‌ترین ابزارهای توسعه است.

برای شروع:

    git init

اضافه کردن فایل‌ها:

    git add .

ثبت تغییرات:

    git commit -m "Initial commit"

---

# انتشار پروژه در GitHub

مراحل کلی:

ساخت Repository

اتصال:

    git remote add origin URL

ارسال:

    git push

---

# پروژه اول: Linux Administration Toolkit

## معرفی

هدف:

ساخت مجموعه ابزار مدیریتی برای لینوکس با Bash.

این ابزار مانند یک پنل مدیریتی داخل ترمینال عمل می‌کند.

---

# امکانات پروژه

ابزار باید بتواند:

- اطلاعات سیستم را نمایش دهد.
- وضعیت منابع را بررسی کند.
- کاربران را مدیریت کند.
- Backup ایجاد کند.
- وضعیت شبکه را بررسی کند.

---

# ساختار پروژه

نمونه:

    linux-toolkit/

        toolkit.sh

        modules/

            system.sh

            network.sh

            backup.sh

        README.md

---

# نمایش اطلاعات سیستم

اطلاعات:

- Hostname
- Kernel
- CPU
- RAM
- Disk

دستورات:

    hostname

    uname

    free

    df

---

# پروژه دوم: Automated Backup System

## معرفی

ساخت یک سیستم Backup خودکار.

هدف:

محافظت از اطلاعات مهم کاربر.

---

# قابلیت‌ها

سیستم Backup باید:

- فایل‌ها را کپی کند.
- Archive بسازد.
- تاریخ Backup را ذخیره کند.
- گزارش ایجاد کند.
- با Cron اجرا شود.

---

# ساخت Backup Script

فایل:

    backup.sh

وظایف:

- دریافت مسیر فایل‌ها
- ساخت پوشه Backup
- فشرده‌سازی اطلاعات
- ذخیره Log

---

# زمان‌بندی Backup

استفاده از:

    cron

مثال:

اجرای هر شب:

    0 2 * * * backup.sh

---

# پروژه سوم: System Monitoring Tool

## معرفی

ساخت ابزار بررسی وضعیت سیستم.

---

# اطلاعات قابل نمایش

CPU:

    top

RAM:

    free -h

Disk:

    df -h

Network:

    ip addr

Processes:

    ps

---

# امکانات بیشتر

می‌توان اضافه کرد:

- هشدار مصرف بالای CPU
- ذخیره گزارش روزانه
- ارسال Notification

---

# پروژه چهارم: Linux Server Deployment

## معرفی

راه‌اندازی یک Server لینوکسی واقعی.

---

# مراحل پروژه

## مرحله اول

آماده‌سازی سیستم:

- Update
- User Setup
- SSH Setup

---

## مرحله دوم

نصب سرویس‌ها:

- Nginx
- Database
- Firewall

---

## مرحله سوم

امن‌سازی:

- Disable Root Login
- SSH Key
- Firewall Rules

---

# پروژه پنجم: Linux Security Auditor

## معرفی

ساخت ابزار بررسی امنیت سیستم.

---

# بررسی کاربران

نمایش:

- کاربران سیستم
- کاربران دارای sudo
- Loginهای اخیر

دستورات:

    who

    last

---

# بررسی Permissionها

بررسی فایل‌های حساس:

    /etc/passwd

    /etc/shadow

---

# بررسی سرویس‌ها

نمایش سرویس‌های فعال:

    systemctl list-units --type=service

---

# بررسی پورت‌ها

دستور:

    ss -tuln

نمایش پورت‌های باز.

---

# پروژه ششم: Log Analyzer

## معرفی

ساخت ابزار تحلیل Log.

---

# قابلیت‌ها

ابزار می‌تواند:

- خطاها را پیدا کند.
- IPهای پرتکرار را نمایش دهد.
- تعداد درخواست‌ها را محاسبه کند.

---

# ابزارهای استفاده شده

- grep
- awk
- sed
- sort
- uniq
- wc

---

# مثال تحلیل Log

پیدا کردن خطاها:

    grep ERROR logfile

شمارش:

    wc -l

---

# پروژه هفتم: شخصی‌سازی محیط لینوکس

## معرفی

ساخت یک محیط کاری حرفه‌ای.

---

# موارد قابل شخصی‌سازی

- Shell
- Terminal
- Theme
- Font
- Alias
- Neovim Config

---

# ساخت Bash Configuration

فایل:

    ~/.bashrc

موارد:

- Aliasها
- Environment Variableها
- تنظیمات Shell

---

# تست پروژه‌ها

قبل از انتشار:

باید بررسی شود:

- آیا Script اجرا می‌شود؟
- آیا خطا مدیریت شده؟
- آیا Documentation کامل است؟
- آیا روی سیستم دیگر کار می‌کند؟

---

# Debug کردن پروژه‌ها

برای Bash:

    bash -x script.sh

برای مشاهده خطاها:

    echo $?

---

# اصول پروژه حرفه‌ای

یک پروژه خوب باید:

- ساده باشد.
- قابل توسعه باشد.
- مستند باشد.
- امن باشد.
- قابل استفاده مجدد باشد.

---

# ساخت Portfolio لینوکسی

پروژه‌های لینوکسی می‌توانند در Portfolio قرار بگیرند.

موارد مهم:

- GitHub Repository
- README حرفه‌ای
- Screenshot
- توضیح فنی
- مثال استفاده

---

# مسیر بعد از این دوره

بعد از پایان این دوره می‌توانید وارد مسیرهای تخصصی شوید:

---

# Linux System Administration

موضوعات:

- مدیریت سرورهای بزرگ
- شبکه
- Storage پیشرفته
- Monitoring

---

# DevOps

موضوعات:

- Docker
- Kubernetes
- CI/CD
- Cloud

---

# Cyber Security

موضوعات:

- Linux Hardening
- Penetration Testing
- Security Tools

---

# Cloud Computing

موضوعات:

- AWS
- Azure
- Infrastructure

---

# تمرین نهایی

یک پروژه کامل انتخاب کنید.

پیشنهاد:

## Linux Administration Toolkit

باید شامل:

- Bash Script
- Documentation
- Git Repository
- Testing
- Automation

باشد.

---

# جمع‌بندی فصل هجدهم

در این فصل یاد گرفتیم:

- چگونه پروژه لینوکسی بسازیم.
- چگونه دانش خود را عملی کنیم.
- چگونه ابزارهای مدیریتی ایجاد کنیم.
- چگونه پروژه را مستند کنیم.
- چگونه از Git استفاده کنیم.
- چگونه Portfolio لینوکسی بسازیم.

با پایان این فصل، شما مسیر:

    Linux Beginner

تا:

    Linux Power User

را کامل کرده‌اید.

اما یادگیری لینوکس پایان ندارد.

لینوکس یک مهارت زنده است و کاربران حرفه‌ای همیشه در حال یادگیری، آزمایش و ساختن هستند.
