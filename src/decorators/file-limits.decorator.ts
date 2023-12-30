import { applyDecorators, BadRequestException, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

export function FileLimits() {
    return applyDecorators(
        UseInterceptors(
            FileInterceptor('file', {
                limits: {
                    fileSize: 1024 * 1024 * 10,
                    files: 1
                },
                fileFilter: (req, file, cb) => {
                    if (
                        file.mimetype !== 'application/octet-stream' &&
                        !/image\/(jpg|jpeg|png|gif)$/.test(file.mimetype)
                    ) {
                        cb(new BadRequestException(`BAD_REQUEST`), false);
                    } else {
                        cb(null, true);
                    }
                }
            })
        )
    );
}
