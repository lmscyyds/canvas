from PIL import Image, ImageDraw, ImageFont


def create_cross_stitch_text(text, font_path, output_path, image_size=(600, 200), font_size=48, stitch_size=12,
                             stitch_color=(255, 0, 0), line_thickness=2):
    # 创建图像背景
    image = Image.new("RGB", image_size, (255, 255, 255))  # 白色背景
    draw = ImageDraw.Draw(image)

    # 加载字体
    font = ImageFont.truetype(font_path, font_size)

    # 计算文字的宽度和高度
    # 使用 textbbox 来计算文本的边界框
    text_bbox = draw.textbbox((0, 0), text, font=font)
    text_width = text_bbox[2] - text_bbox[0]
    text_height = text_bbox[3] - text_bbox[1]

    # 文字起始位置（居中对齐）
    x = (image_size[0] - text_width) // 2
    y = (image_size[1] - text_height) // 2

    # 绘制文字
    draw.text((x, y), text, font=font, fill=(0, 0, 0))  # 绘制黑色文字

    # 为每个字母绘制十字绣效果
    for ix in range(len(text)):
        letter = text[ix]
        letter_width, letter_height = draw.textsize(letter, font=font)

        # 获取每个字母的区域
        letter_x = x + sum([draw.textsize(text[i], font=font)[0] for i in range(ix)])
        letter_y = y

        # 为字母区域绘制十字绣效果
        for i in range(0, letter_width, stitch_size):
            for j in range(0, letter_height, stitch_size):
                # 每个“针脚”的中心位置
                center_x = letter_x + i + stitch_size // 2
                center_y = letter_y + j + stitch_size // 2

                # 绘制十字绣交叉线（水平和垂直）
                # 水平线
                draw.line([(center_x - stitch_size // 2, center_y), (center_x + stitch_size // 2, center_y)],
                          fill=stitch_color, width=line_thickness)
                # 垂直线
                draw.line([(center_x, center_y - stitch_size // 2), (center_x, center_y + stitch_size // 2)],
                          fill=stitch_color, width=line_thickness)

    # 保存结果图像
    image.save(output_path)
    image.show()


# 示例：调用函数生成十字绣效果的文本
create_cross_stitch_text(
    text="Cross Stitch",
    font_path=r"C:\Windows\Fonts\Arial.ttf",  # 替换为你的字体文件路径
    output_path="cross_stitch_text_output.png"
)
