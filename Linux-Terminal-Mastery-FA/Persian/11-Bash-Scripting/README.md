# فصل یازدهم: اسکریپت‌نویسی Bash

## Bash Scripting

اسکریپت Bash مجموعه‌ای از دستورهاست که در یک فایل اجرا می‌شود. اسکریپت خوب باید ورودی و خطا را کنترل کند، متغیرها را درست quote کند و نتیجهٔ قابل پیش‌بینی داشته باشد.

---

# اولین اسکریپت

فایل `hello.sh`:

```bash
#!/usr/bin/env bash

printf '%s\n' 'سلام از Bash'
```

خط اول **shebang** است و مفسر را هنگام اجرای مستقیم فایل مشخص می‌کند. اجرا با Bash نیازی به مجوز execute ندارد:

```bash
bash hello.sh
```

برای اجرای مستقیم:

```bash
chmod +x hello.sh
./hello.sh
```

`sh hello.sh` الزاماً Bash را اجرا نمی‌کند؛ پس برای اسکریپتی که از قابلیت‌های Bash استفاده می‌کند آن را به کار نبرید.

---

# متغیرها و Quoting

در انتساب، اطراف `=` فاصله قرار نمی‌گیرد:

```bash
name='Amir'
printf 'Hello, %s\n' "$name"
```

تقریباً همیشه گسترش متغیر را داخل کوتیشن دوتایی بنویسید:

```bash
cp -- "$source" "$destination"
```

این کار از شکستن مقدار روی فاصله‌ها و گسترش wildcard جلوگیری می‌کند. کوتیشن تکی محتوا را کاملاً literal نگه می‌دارد؛ در کوتیشن دوتایی متغیرها و command substitution گسترش می‌یابند.

برای گرفتن خروجی دستور:

```bash
current_date=$(date +%F)
```

از backtick قدیمی استفاده نکنید؛ `$(...)` خواناتر و قابل تو در تو شدن است.

---

# آرگومان‌ها و وضعیت خروج

متغیرهای مهم:

- `$0`: نام اسکریپت
- `$1` تا `$9`: آرگومان‌ها
- `$#`: تعداد آرگومان‌ها
- `"$@"`: همهٔ آرگومان‌ها با حفظ مرز هر آرگومان
- `$?`: وضعیت خروج آخرین دستور

نمونهٔ کنترل ورودی:

```bash
#!/usr/bin/env bash

if (( $# != 1 )); then
    printf 'Usage: %s FILE\n' "$0" >&2
    exit 2
fi

file=$1
if [[ ! -f $file ]]; then
    printf 'Error: not a regular file: %s\n' "$file" >&2
    exit 1
fi

wc -l -- "$file"
```

وضعیت صفر یعنی موفقیت و مقدار غیرصفر یعنی خطا یا وضعیت ویژه.

---

# شرط‌ها

برای آزمون‌های Bash، `[[ ... ]]` معمولاً امن‌تر و رساتر از `[ ... ]` است:

```bash
if [[ -d $path ]]; then
    printf '%s is a directory\n' "$path"
elif [[ -e $path ]]; then
    printf '%s exists\n' "$path"
else
    printf '%s does not exist\n' "$path"
fi
```

آزمون‌های رایج:

- `-e`: مسیر وجود دارد
- `-f`: فایل معمولی است
- `-d`: دایرکتوری است
- `-r`، `-w` و `-x`: دسترسی خواندن، نوشتن یا اجرا وجود دارد
- `-n`: رشته خالی نیست
- `-z`: رشته خالی است

برای مقایسهٔ عددی می‌توان از حساب Bash استفاده کرد:

```bash
if (( count > 10 )); then
    printf '%s\n' 'large'
fi
```

---

# حلقه‌ها

پردازش درست همهٔ آرگومان‌ها:

```bash
for file in "$@"; do
    printf '%s\n' "$file"
done
```

خواندن فایل خط‌به‌خط بدون حذف backslash یا فضای ابتدا و انتها:

```bash
while IFS= read -r line; do
    printf '%s\n' "$line"
done < input.txt
```

برای پیمایش خروجی `ls` از `for file in $(ls)` استفاده نکنید؛ نام فایل می‌تواند فاصله یا newline داشته باشد. برای فایل‌های مسیر فعلی از glob استفاده کنید:

```bash
for file in ./*.txt; do
    [[ -e $file ]] || continue
    printf '%s\n' "$file"
done
```

---

# تابع‌ها

```bash
log_error() {
    printf 'ERROR: %s\n' "$*" >&2
}

if ! mkdir -p -- "$backup_dir"; then
    log_error "cannot create $backup_dir"
    exit 1
fi
```

متغیرهای داخل تابع به‌طور پیش‌فرض global هستند. برای محدودکردن دامنه از `local` استفاده کنید:

```bash
greet() {
    local name=${1:-guest}
    printf 'Hello, %s\n' "$name"
}
```

---

# Pipe، Redirect و خطاها

```bash
command >output.log       # جایگزینی stdout
command >>output.log      # افزودن stdout
command 2>error.log       # ذخیره stderr
command >all.log 2>&1     # هر دو جریان در یک فایل
producer | consumer       # stdout اول به stdin دوم
```

در Bash می‌توان برای آشکارشدن خطاهای رایج از این تنظیمات استفاده کرد:

```bash
set -Eeuo pipefail
```

- `-e`: در بسیاری از خطاهای مدیریت‌نشده خارج می‌شود، اما استثناهای نحوی مهمی دارد.
- `-u`: استفاده از متغیر تعریف‌نشده را خطا می‌کند.
- `pipefail`: شکست هر بخش pipeline را قابل مشاهده می‌کند.

این گزینه‌ها جای کنترل صریح خطا را نمی‌گیرند. دستورهایی که شکستشان انتظار می‌رود باید در `if` یا با مدیریت مشخص نوشته شوند.

---

# فایل موقت و پاک‌سازی

نام ثابت مانند `/tmp/data.txt` می‌تواند تداخل و مشکل امنیتی ایجاد کند. از `mktemp` و `trap` استفاده کنید:

```bash
tmp_file=$(mktemp) || exit 1
trap 'rm -f -- "$tmp_file"' EXIT

printf '%s\n' 'temporary data' >"$tmp_file"
```

---

# نمونهٔ Backup امن‌تر

```bash
#!/usr/bin/env bash
set -Eeuo pipefail

if (( $# != 2 )); then
    printf 'Usage: %s SOURCE_DIR DEST_DIR\n' "$0" >&2
    exit 2
fi

source_dir=$1
dest_dir=$2

if [[ ! -d $source_dir ]]; then
    printf 'Source directory does not exist: %s\n' "$source_dir" >&2
    exit 1
fi

mkdir -p -- "$dest_dir"
timestamp=$(date +%Y%m%d-%H%M%S)
archive=$dest_dir/backup-$timestamp.tar.gz

tar -czf "$archive" -C "$source_dir" .
printf 'Backup created: %s\n' "$archive"
```

این نمونه وجود مبدأ را بررسی می‌کند، مسیرها را quote می‌کند و به‌جای ذخیرهٔ مسیر کامل مبدأ، با `-C` محتوای آن را آرشیو می‌کند. مقصد را داخل مبدأ قرار ندهید، و Backup را با استخراج آزمایشی یا `tar -tzf` بررسی کنید.

---

# بررسی و Debug

بررسی syntax بدون اجرا:

```bash
bash -n script.sh
```

ردیابی اجرا (ممکن است secretها را نمایش دهد):

```bash
bash -x script.sh
```

اگر ShellCheck نصب است، خطاهای رایج را پیدا می‌کند:

```bash
shellcheck script.sh
```

هرگز دادهٔ ورودی را با `eval` اجرا نکنید. برای command و آرگومان‌های پویا از آرایه استفاده کنید:

```bash
cmd=(grep -n -- "$pattern" "$file")
"${cmd[@]}"
```

---

# تمرین‌های فصل یازدهم

1. اسکریپتی بنویسید که دقیقاً یک مسیر بگیرد و نوع آن را تشخیص دهد.
2. چند نام فایل شامل فاصله بسازید و با `"$@"` آن‌ها را درست پردازش کنید.
3. یک فایل را با `while IFS= read -r` خط‌به‌خط بخوانید.
4. نمونهٔ Backup را اجرا و فهرست آرشیو را با `tar -tzf` بررسی کنید.
5. اسکریپت‌ها را با `bash -n` و در صورت دسترسی با ShellCheck آزمایش کنید.

---

# جمع‌بندی

در این فصل اجرای اسکریپت، متغیر و quoting، آرگومان، شرط، حلقه، تابع، redirect، مدیریت خطا، فایل موقت، Backup و روش‌های بررسی Bash را آموختیم.
