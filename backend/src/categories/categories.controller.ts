import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Barcha kategoriyalar ro\'yxati' })
  async findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Kategoriya va uning ustalari' })
  async findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Get(':id/masters')
  @ApiOperation({ summary: 'Kategoriya bo\'yicha ustalar' })
  async getMasters(@Param('id') id: string) {
    return this.categoriesService.getMastersByCategory(id);
  }
}
